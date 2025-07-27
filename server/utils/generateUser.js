const bcrypt = require('bcrypt');

const generatePassword = async (password)=>{

    let salt = await bcrypt.genSalt(parseInt(process.env.ROUNDS))
    let hash = await bcrypt.hash(password,salt);
    return hash;
    
}

module.exports.generatePassword = generatePassword;