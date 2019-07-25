const express = require("express");
const connectDB = require('./config/db')
const app = express();


app.get("/", (req, res) => {
    res.json({msg: "hello"})
})

// DB연결
connectDB();

// 미들웨어 초기화
app.use(express.json({extended: false})) //extended true: qs, extended false: qs-string

// routes
app.use('/api/users', require('./routes/users'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/contacts', require('./routes/contacts'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => { console.log(`server started on port ${PORT}`) })