const jwt = require('jsonwebtoken')

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

module.exports = {
    getUserId,randomToken,getTotalValidTokenCount
}