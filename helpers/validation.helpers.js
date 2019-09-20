const joi =require('@hapi/joi');

//login Validation:
module.exports=function emailValidation(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

