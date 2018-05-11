const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bcrypt = require('bcrypt');

let emailLengthCheck = (email) => {
    if (!email) { return false; }
    else {
        if (email.length < 5 || email.length > 30) { return false; }
        else { return true; }
    }
}
let validEmailCheck = (email) => {
    if (!email) { return false; }
    else {
        const regExp = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
        return regExp.test(email);
    }
}
const emailValid = [
    { validator: emailLengthCheck, message: 'Jumlah karakter di email hanya boleh antara 5 - 30  karakter' },
    { validator: validEmailCheck, message: 'Email tidak valid, cek lagi tulisannya' }
]

let validUsernameCheck = (username) => {
    if (!username) { return false; }
    else {
        const regExp = new RegExp(/^[a-zA-Z0-9_.]+$/)
        return regExp.test(username);
    }
}
const usernameValid = [
    { validator: validUsernameCheck, message: 'Username tidak valid, hanya boleh huruf a - z dan karakter . _' }
]

const userSchema = new Schema({
    email: { type: String, required: true, unique: true, lowercase: true, validate: emailValid },
    username: { type: String, required: true, unique: true, lowercase: true, validate: usernameValid },
    password: { type: String, required: true },
    role: {
        role_id: { type: Number },
        role_type: { type: String }
    }

});

userSchema.pre('save', function (next) {
    if (!this.isModified('password')) return next();

    bcrypt.hash(this.password, 10, (err, hash) => {
        if (err) return next(err);
        this.password = hash;
        next();
    })
})

userSchema.methods.cekPasswd = function (password) {
    return bcrypt.compareSync(password, this.password);
}

mongoose.model('User', userSchema);