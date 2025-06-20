exports.isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
exports.isValidUser = (name, email, age) => name && email && age && !isNaN(age);