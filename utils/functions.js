const jwt = require('jsonwebtoken')
const crypto = require('crypto')

const getUserId = (token) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded.id; // Return the decoded userID
    } catch (err) {
        return null; // Return null if verification fails
    }
}

const MaxExpTime = 3 * 24 * 60 * 60 // expire in 3days
const randomToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: MaxExpTime
  })
}

const getTotalValidTokenCount = (val) => {
  console.log(val,' : val')
  return val;
};

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: MaxExpTime
  })
}

const generateSimpleUniqueId = () => {
  const uniqueId = crypto.randomBytes(16).toString('base64'); // Generate a random unique ID
  return uniqueId;
}


module.exports = {
    getUserId,randomToken,getTotalValidTokenCount,generateSimpleUniqueId
}