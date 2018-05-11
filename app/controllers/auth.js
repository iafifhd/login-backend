const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = mongoose.model('User');
const jwt = require('jsonwebtoken');


module.exports = (app) => {
  app.use('/auth', router);
};

router.get('/alluser', (req, res, next) => {
  User.find({})
    .exec((err, result) => {res.json(result)})
});

router.post('/register', (req, res) => {
  if (!req.body.email) {
    res.json({ success: false, message: 'Email tidak boleh kosong' })
  } else {
    if (!req.body.username) {
      res.json({ success: false, message: 'Username tidak boleh kosong' })
    } else {
      if (!req.body.password) {
        res.json({ success: false, message: 'Password tidak boleh kosong' })
      } else {
        let roledata = {};
        console.log(req.body.role_id);
        switch (req.body.role_id) {
          case '1':
            roledata = { role_id: 1, role_type: "Admin" }
            break;
          case '2':
            roledata = { role_id: 2, role_type: "User" }
            break;
          default:
            roledata = { role_id: 2, role_type: "User" }
        }
        console.log(roledata);

        let user = new User({
          email: req.body.email.toLowerCase(),
          username: req.body.username.toLowerCase(),
          password: req.body.password,
          role: { role_id: roledata.role_id, role_type: roledata.role_type}
        })

        User.find({ $or: [{ username: user.username }, { email: user.email }] })
          .exec((err, result) => {
            if (result.length < 1) {
              user.save((err) => {
                if (err) {
                  var errMsg = ''
                  if (err.errors) {
                    if (err.errors.email) { errMsg = errMsg + err.errors.email.message + ' ' }
                    if (err.errors.username) { errMsg = errMsg + err.errors.username.message }
                  } else { errMsg = err }
                  res.json({ success: false, message: 'Data user tidak bisa disimpan', error: errMsg });
                } else {
                  res.json({ success: true, message: 'User disimpan' })
                }
              })

            } else {
              res.json({ success: false, message: 'Username/email sudah ada' })
            }
          })
      }
    }
  }
});

router.post('/login', (req, res) => {
  if (!req.body.username) {
    res.json({ success: false, message: 'Username Kosong' })
  } else {
    if (!req.body.password) {
      res.json({ success: false, message: 'Password Kosong' })
    } else {
      
      User.findOne({ username: req.body.username.toLowerCase() }, (err, user) => {
        if (err) {
          res.json({ success: false, message: err })
        } else {
          if (!user) {
            res.json({ success: false, message: "Username tidak ditemukan" })
          } else {
            console.log(user);
            // res.json({success: true, message:user})
            const validPass = user.cekPasswd(req.body.password);
            if (!validPass) {
              res.json({ success: false, message: "Password Salah" })
            } else {
              // buat teken yg isinya user ID, secret key dari config
              const token = jwt.sign({ userId: user._id, username: user.username }, "Rahasia", { expiresIn: '3h' });
              res.json({ success: true, message: "Ok, Login Berhasil", token: token, user: { _id:user._id, username: user.username, role: { role_id: user.role.role_id, role_type: user.role.role_type} } });
            }
          }
        }
      })
    }
  }
});

router.get('/cekemail/:email', (req, res) => {
  if (!req.params.email) {
    res.json({ success: false, message: 'Email tidak boleh kosong' })
  } else {
    User.findOne({ email: req.params.email }, (err, user) => {
      if (err) {
        res.json({ success: false, message: err });
      } else {
        if (user) {
          res.json({ success: false, message: 'E-mail sudah terdaftar' }); // Return as taken e-mail
        } else {
          res.json({ success: true, message: 'E-mail tersedia' }); // Return as available e-mail
        }
      }
    })
  }
});

router.get('/cekusername/:username', (req, res) => {
  if (!req.params.username) {
    res.json({ success: false, message: 'Username tidak boleh kosong' })
  } else {
    User.findOne({ username: req.params.username }, (err, user) => {
      if (err) {
        res.json({ success: false, message: err });
      } else {
        if (user) {
          res.json({ success: false, message: 'Username sudah terdaftar' }); // Return as taken e-mail
        } else {
          res.json({ success: true, message: 'Username tersedia' }); // Return as available e-mail
        }
      }
    })
  }
});

router.delete('/deleteuser/:userID',(req,res)=>{
  User.remove({_id:req.params.userId},(err)=>{console.log(err);})
})


router.use((req, res, next) => {
  // cek setiap req yg mempunyai headers 'auth'
  const token = req.headers['auth'];
  if (!token) {
    res.json({ success: false, message: "Tidak ada token" });
  } else {
    jwt.verify(token, 'Rahasia', (err, decoded) => {
      if (err) {
        res.json({ success: false, message: "Token sudah tidak valid", error: err });
      } else {
        req.decoded = decoded;
        next();
      }
    })
  }
})

router.get('/profile', (req, res) => {
  User.findOne({ _id: req.decoded.userId }, { username: 1, email: 1, role:1 }, (err, user) => {
    if (err) {
      res.json({ success: false, message: 'Server error', error: err });
    } else {
      if (!user) {
        res.json({ success: false, message: 'User tidak ditemukan' });
      } else { res.json({ success: true, message: 'Ok, Profile User', user: user }); }
    }
  })
})