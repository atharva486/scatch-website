#!/usr/bin/env bash
# End-to-end smoke test against a running API.
# Usage: ./scripts/smoke.sh [base_url]
set -uo pipefail

BASE="${1:-http://localhost:3000}"
JAR_DIR="$(mktemp -d)"
PASS=0
FAIL=0

cleanup() { rm -rf "$JAR_DIR"; }
trap cleanup EXIT

check() { # check <description> <condition-result>
  if [ "$2" = "true" ]; then
    printf '  \033[32m✓\033[0m %s\n' "$1"; PASS=$((PASS + 1))
  else
    printf '  \033[31m✗\033[0m %s\n' "$1"; FAIL=$((FAIL + 1))
  fi
}

jq_get() { node -e "
  let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{
    try{const o=JSON.parse(d);const v=process.argv[1].split('.').reduce((a,k)=>a==null?a:a[k],o);
    process.stdout.write(v===undefined||v===null?'':String(v));}catch{process.stdout.write('')}
  });" "$1"; }

SUFFIX="$(date +%s)$RANDOM"
U_EMAIL="user${SUFFIX}@scatch.test"
S_EMAIL="seller${SUFFIX}@scatch.test"
PASSWORD="Password123"

echo ""
echo "Scatch API smoke test -> $BASE"
echo ""

# ---------------------------------------------------------------- health
echo "Health"
H="$(curl -s --max-time 10 "$BASE/api/health")"
check "health endpoint reports ok" "$([ "$(echo "$H" | jq_get status)" = "ok" ] && echo true)"
check "database is connected"     "$([ "$(echo "$H" | jq_get database)" = "connected" ] && echo true)"

# ------------------------------------------------------------ validation
echo ""
echo "Input validation"
R="$(curl -s --max-time 10 -X POST "$BASE/api/user/register" -H 'Content-Type: application/json' -d '{"email":"bad","password":"x"}')"
check "rejects malformed email" "$([ "$(echo "$R" | jq_get success)" = "false" ] && echo true)"

R="$(curl -s --max-time 10 -X POST "$BASE/api/user/register" -H 'Content-Type: application/json' -d "{\"fullname\":\"A B\",\"email\":\"a@b.com\",\"password\":\"short\"}")"
check "rejects short password" "$([ "$(echo "$R" | jq_get success)" = "false" ] && echo true)"

R="$(curl -s --max-time 10 -X POST "$BASE/api/seller/register" -H 'Content-Type: application/json' -d "{\"fullname\":\"Seller One\",\"email\":\"$S_EMAIL\",\"password\":\"$PASSWORD\",\"gstin\":\"123\"}")"
check "rejects invalid GSTIN" "$([ "$(echo "$R" | jq_get success)" = "false" ] && echo true)"

# ----------------------------------------------------------------- auth
echo ""
echo "Authentication"
R="$(curl -s --max-time 10 -X POST "$BASE/api/user/register" -H 'Content-Type: application/json' -d "{\"fullname\":\"Test User\",\"email\":\"$U_EMAIL\",\"password\":\"$PASSWORD\"}")"
check "registers a customer" "$([ "$(echo "$R" | jq_get success)" = "true" ] && echo true)"

R="$(curl -s --max-time 10 -X POST "$BASE/api/user/register" -H 'Content-Type: application/json' -d "{\"fullname\":\"Test User\",\"email\":\"$U_EMAIL\",\"password\":\"$PASSWORD\"}")"
check "blocks duplicate email" "$([ "$(echo "$R" | jq_get success)" = "false" ] && echo true)"

R="$(curl -s --max-time 10 -X POST "$BASE/api/seller/register" -H 'Content-Type: application/json' -d "{\"fullname\":\"Seller One\",\"email\":\"$S_EMAIL\",\"password\":\"$PASSWORD\",\"gstin\":\"27ABCDE1234F1Z5\"}")"
check "registers a seller" "$([ "$(echo "$R" | jq_get success)" = "true" ] && echo true)"

CODE="$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 -X POST "$BASE/api/user/login" -H 'Content-Type: application/json' -d "{\"email\":\"$S_EMAIL\",\"password\":\"$PASSWORD\"}")"
check "a seller account cannot log in as a customer ($CODE)" "$([ "$CODE" = "401" ] && echo true)"

R="$(curl -s --max-time 10 -X POST "$BASE/api/user/login" -H 'Content-Type: application/json' -d "{\"email\":\"$U_EMAIL\",\"password\":\"wrongpass\"}")"
check "rejects wrong password" "$([ "$(echo "$R" | jq_get success)" = "false" ] && echo true)"

curl -s --max-time 10 -c "$JAR_DIR/user" -X POST "$BASE/api/user/login" -H 'Content-Type: application/json' -d "{\"email\":\"$U_EMAIL\",\"password\":\"$PASSWORD\"}" > /dev/null
check "customer login sets a cookie" "$([ -s "$JAR_DIR/user" ] && echo true)"

curl -s --max-time 10 -c "$JAR_DIR/seller" -X POST "$BASE/api/seller/login" -H 'Content-Type: application/json' -d "{\"email\":\"$S_EMAIL\",\"password\":\"$PASSWORD\"}" > /dev/null
check "seller login sets a cookie" "$([ -s "$JAR_DIR/seller" ] && echo true)"

R="$(curl -s --max-time 10 -b "$JAR_DIR/user" "$BASE/api/session")"
check "session identifies a customer" "$([ "$(echo "$R" | jq_get role)" = "user" ] && echo true)"

# ------------------------------------------------------- authorization
echo ""
echo "Authorization (previously all public)"
CODE="$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 "$BASE/api/seller/products")"
check "anonymous cannot list seller products ($CODE)" "$([ "$CODE" = "401" ] && echo true)"

CODE="$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 -b "$JAR_DIR/user" "$BASE/api/seller/monthly_revenue")"
check "customer cannot read seller analytics ($CODE)" "$([ "$CODE" = "401" ] && echo true)"

CODE="$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 "$BASE/api/user/profile")"
check "anonymous cannot read a profile ($CODE)" "$([ "$CODE" = "401" ] && echo true)"

CODE="$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 -b "$JAR_DIR/user" "$BASE/api/user/edit/products" -H 'Content-Type: application/json' -d '{"newVal":"x"}')"
check "customer cannot edit arbitrary fields ($CODE)" "$([ "$CODE" = "400" ] && echo true)"

CODE="$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 -b "$JAR_DIR/seller" "$BASE/api/user/profile")"
check "seller session rejected on customer routes ($CODE)" "$([ "$CODE" = "401" ] && echo true)"

# ------------------------------------------------------------- products
echo ""
echo "Product lifecycle"
PNG_B64="iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFAAH/q842iQAAAABJRU5ErkJggg=="
PNG_FILE="$JAR_DIR/pixel.png"
printf '%s' "$PNG_B64" | base64 -d > "$PNG_FILE"

R="$(curl -s --max-time 20 -b "$JAR_DIR/seller" -X POST "$BASE/api/seller/create" \
  -F "productname=Test Widget" -F "price=499" -F "description=A widget for testing" \
  -F "stock=5" -F "image=@${PNG_FILE};type=image/png;filename=pixel.png")"
PRODUCT_ID="$(echo "$R" | jq_get product._id)"
check "seller creates a product" "$([ -n "$PRODUCT_ID" ] && echo true)"

R="$(curl -s --max-time 10 -b "$JAR_DIR/seller" "$BASE/api/seller/products")"
check "seller product list includes it" "$([ -n "$(echo "$R" | jq_get products.0.productname)" ] && echo true)"

R="$(curl -s --max-time 10 -b "$JAR_DIR/user" "$BASE/api/product/$PRODUCT_ID")"
check "customer can read the product" "$([ "$(echo "$R" | jq_get success)" = "true" ] && echo true)"

CODE="$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 "$BASE/api/product/nope")"
check "unknown API route returns 404 ($CODE)" "$([ "$CODE" = "404" ] && echo true)"

# -------------------------------------------------------------- orders
echo ""
echo "Ordering"
R="$(curl -s --max-time 10 -b "$JAR_DIR/user" "$BASE/api/product/product_details/$PRODUCT_ID")"
check "product_details route is not shadowed" "$([ "$(echo "$R" | jq_get success)" = "true" ] && echo true)"

R="$(curl -s --max-time 10 -b "$JAR_DIR/user" -X POST "$BASE/api/product/buy/$PRODUCT_ID" \
  -H 'Content-Type: application/json' -d '{"quantity":0,"address":"Somewhere"}')"
check "rejects quantity of 0" "$([ "$(echo "$R" | jq_get success)" = "false" ] && echo true)"

R="$(curl -s --max-time 10 -b "$JAR_DIR/user" -X POST "$BASE/api/product/buy/$PRODUCT_ID" \
  -H 'Content-Type: application/json' -d '{"quantity":1,"address":"   "}' -b "$JAR_DIR/user")"
check "rejects blank address" "$([ "$(echo "$R" | jq_get success)" = "false" ] && echo true)"

R="$(curl -s --max-time 10 -b "$JAR_DIR/user" -X POST "$BASE/api/product/buy/$PRODUCT_ID" \
  -H 'Content-Type: application/json' -d '{"quantity":2,"address":"221B Baker Street","price":1}')"
check "places an order" "$([ "$(echo "$R" | jq_get success)" = "true" ] && echo true)"

R="$(curl -s --max-time 10 -b "$JAR_DIR/user" "$BASE/api/product/$PRODUCT_ID")"
STOCK_LEFT="$(echo "$R" | jq_get product.stock)"
check "stock decremented 5 -> $STOCK_LEFT" "$([ "$STOCK_LEFT" = "3" ] && echo true)"

R="$(curl -s --max-time 10 -b "$JAR_DIR/user" -X POST "$BASE/api/product/buy/$PRODUCT_ID" \
  -H 'Content-Type: application/json' -d '{"quantity":99,"address":"221B Baker Street"}')"
check "blocks overselling" "$([ "$(echo "$R" | jq_get success)" = "false" ] && echo true)"

R="$(curl -s --max-time 10 -b "$JAR_DIR/user" "$BASE/api/user/get_products")"
ORDER_ID="$(echo "$R" | jq_get orders.0._id)"
ORDER_PRICE="$(echo "$R" | jq_get orders.0.buyPrice)"
check "order appears in history" "$([ -n "$ORDER_ID" ] && echo true)"
check "order price came from the database, not the client (got $ORDER_PRICE)" "$([ "$ORDER_PRICE" = "499" ] && echo true)"

R="$(curl -s --max-time 10 -b "$JAR_DIR/user" -X POST "$BASE/api/product/order_details" \
  -H 'Content-Type: application/json' -d "{\"order_id\":\"$ORDER_ID\"}")"
check "order details resolve by id" "$([ "$(echo "$R" | jq_get order.address)" = "221B Baker Street" ] && echo true)"

# -------------------------------------------------------------- wishlist
echo ""
echo "Wishlist"
curl -s --max-time 10 -b "$JAR_DIR/user" -X POST "$BASE/api/product/add_to_cart/$PRODUCT_ID" > /dev/null
curl -s --max-time 10 -b "$JAR_DIR/user" -X POST "$BASE/api/product/add_to_cart/$PRODUCT_ID" > /dev/null
R="$(curl -s --max-time 10 -b "$JAR_DIR/user" "$BASE/api/user/wishlist_products")"
COUNT="$(echo "$R" | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{const o=JSON.parse(d);process.stdout.write(String((o.wishlist||[]).length))})")"
check "double add-to-cart does not duplicate (count=$COUNT)" "$([ "$COUNT" = "1" ] && echo true)"

R="$(curl -s --max-time 10 -b "$JAR_DIR/user" -X POST "$BASE/api/user/delete/wishlist_item/$PRODUCT_ID")"
check "removes wishlist item" "$([ "$(echo "$R" | jq_get success)" = "true" ] && echo true)"

# ------------------------------------------------------------- analytics
echo ""
echo "Seller analytics"
R="$(curl -s --max-time 10 -b "$JAR_DIR/seller" "$BASE/api/seller/low_stock")"
check "low_stock reports success" "$([ "$(echo "$R" | jq_get success)" = "true" ] && echo true)"

R="$(curl -s --max-time 10 -b "$JAR_DIR/seller" "$BASE/api/seller/monthly_revenue")"
check "monthly_revenue returns data" "$([ "$(echo "$R" | jq_get success)" = "true" ] && echo true)"
check "revenue equals 2 x 499 = 998" "$([ "$(echo "$R" | jq_get data_req.0.totalRevenue)" = "998" ] && echo true)"

R="$(curl -s --max-time 10 -b "$JAR_DIR/seller" "$BASE/api/seller/monthly_orders")"
check "monthly_orders returns data" "$([ "$(echo "$R" | jq_get success)" = "true" ] && echo true)"

R="$(curl -s --max-time 10 -b "$JAR_DIR/seller" "$BASE/api/seller/prod_quantity")"
check "prod_quantity returns data" "$([ "$(echo "$R" | jq_get success)" = "true" ] && echo true)"

# ------------------------------------------------------------ ownership
echo ""
echo "Seller ownership isolation"
R="$(curl -s --max-time 10 -X POST "$BASE/api/seller/register" -H 'Content-Type: application/json' -d "{\"fullname\":\"Other Seller\",\"email\":\"other${SUFFIX}@scatch.test\",\"password\":\"$PASSWORD\",\"gstin\":\"29ABCDE1234F1Z5\"}")"
curl -s --max-time 10 -c "$JAR_DIR/seller2" -X POST "$BASE/api/seller/login" -H 'Content-Type: application/json' -d "{\"email\":\"other${SUFFIX}@scatch.test\",\"password\":\"$PASSWORD\"}" > /dev/null

CODE="$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 -b "$JAR_DIR/seller2" "$BASE/api/product/show_seller/$PRODUCT_ID")"
check "other seller cannot view the product ($CODE)" "$([ "$CODE" = "403" ] && echo true)"

CODE="$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 -b "$JAR_DIR/seller2" -X POST "$BASE/api/product/change_price/$PRODUCT_ID" -H 'Content-Type: application/json' -d '{"newprice":1}')"
check "other seller cannot change its price ($CODE)" "$([ "$CODE" = "403" ] && echo true)"

CODE="$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 -b "$JAR_DIR/seller2" -X POST "$BASE/api/product/restock/$PRODUCT_ID" -H 'Content-Type: application/json' -d '{"newStock":100}')"
check "other seller cannot restock it ($CODE)" "$([ "$CODE" = "403" ] && echo true)"

CODE="$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 -b "$JAR_DIR/seller2" -X POST "$BASE/api/seller/delete" -H 'Content-Type: application/json' -d "{\"product_id\":\"$PRODUCT_ID\"}")"
check "other seller cannot delete it ($CODE)" "$([ "$CODE" = "403" ] && echo true)"

# The same actions must still work for the seller who actually owns it.
R="$(curl -s --max-time 10 -b "$JAR_DIR/seller" -X POST "$BASE/api/product/change_price/$PRODUCT_ID" -H 'Content-Type: application/json' -d '{"newprice":750}')"
check "owner can change their own price" "$([ "$(echo "$R" | jq_get product.price)" = "750" ] && echo true)"

R="$(curl -s --max-time 10 -b "$JAR_DIR/seller" -X POST "$BASE/api/product/restock/$PRODUCT_ID" -H 'Content-Type: application/json' -d '{"newStock":4}')"
check "owner can restock their own product" "$([ "$(echo "$R" | jq_get product.stock)" = "7" ] && echo true)"

CODE="$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 -b "$JAR_DIR/seller" "$BASE/api/product/show_seller/$PRODUCT_ID")"
check "owner can view their own product ($CODE)" "$([ "$CODE" = "200" ] && echo true)"

# ------------------------------------------------------ deletion guard
echo ""
echo "Deletion rules"
CODE="$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 -b "$JAR_DIR/seller" -X POST "$BASE/api/seller/delete" -H 'Content-Type: application/json' -d "{\"product_id\":\"$PRODUCT_ID\"}")"
check "cannot delete a product that has orders ($CODE)" "$([ "$CODE" = "400" ] && echo true)"

# ---------------------------------------------------------------- logout
echo ""
echo "Logout"
curl -s --max-time 10 -b "$JAR_DIR/user" -c "$JAR_DIR/user" -X POST "$BASE/api/user/logout" > /dev/null
CODE="$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 -b "$JAR_DIR/user" "$BASE/api/user/profile")"
check "cookie is really cleared on logout ($CODE)" "$([ "$CODE" = "401" ] && echo true)"

# ----------------------------------------------------------------- done
echo ""
echo "-------------------------------------------"
printf 'Passed: \033[32m%d\033[0m   Failed: \033[31m%d\033[0m\n' "$PASS" "$FAIL"
echo "-------------------------------------------"
[ "$FAIL" -eq 0 ] || exit 1