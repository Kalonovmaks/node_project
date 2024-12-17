const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const mysql = require('mysql')
const { error } = require('console')

const app = express()

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));


const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'mnode'
});

connection.connect((err) => {
    if (err) {
        return console.error('Ошибка подключения к базе данных: ' + err.message)
    }
    console.log('Подключение к базе данных успешно установлено');
})

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname,'public', 'index.html'));
})

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname,'public', 'autorization.html'));
})


app.post('/autorization', (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const pass = req.body.pass;
    const pass_c = req.body.pass_c;

    
    function validatePassword(password) {
        const minLength = 8
        const maxLength = 20
        const hasUpperCase = /[A-Z]/.test(password)
        const hasLowerCase = /[a-z]/.test(password)
        const hasDigit = /[0-9]/.test(password)
        if (password.length < minLength || password.length > maxLength) {
            return 'Пароль должен быть длиной от ${minLength} до ${maxLength} символов.'
        }
        if (!hasUpperCase) {
            return 'Пароль должен содержать хотя бы одну заглавную букву.'
        }
        if (!hasLowerCase) {
            return 'Пароль должен содержать хотя бы одну строчную букву.'
        }
        if (!hasDigit) {
            return 'Пароль должен содержать хотя бы одну цифру.'
        }
        return 'valid'
    }

    
    const validationMessage = validatePassword(pass)
    if (validationMessage !== 'valid') {
        return res.send(validationMessage);
    }

    if (pass !== pass_c) {
        return res.send('Пароли не совпадают.')
    }
    const sql = `INSERT INTO users (name, email, password) VALUES (?, ?, MD5(?))`
    connection.query(sql, [name, email, pass], (error, result) => {
        if (error) {
            return res.send('Ошибка при добавлении пользователя: ' + error.message)
        }
        res.redirect('/login');
    })
})

app.post('/login',(req,res)=>{
    const {email, pass} =req.body

    const sql=`Select*from users where email=? and password=md5(?)`
    connection.query(sql,[email,pass],(error,result)=>{
        if(error){
            return res.send('Error select users '+error.message)
        }
        if(result.length>0){
            const userName = result[0].name
            res.redirect(`/welcome?name=${encodeURIComponent(userName)}`)
        }else{
            res.send('Invalid email or password.')
        }
        
    })
});

app.get('/welcome',(req,res)=>{
    res.sendFile(path.join(__dirname,'public', 'welcome.html'));
})


// Роут барои илова кардани сотрудник
app.post('/add-employee', (req, res) => {
    const { name, email, tell, adress,vazifa } = req.body;

    if (!name || !email || !tell || !adress || !vazifa) {
        return res.send('Лутфан ҳамаи майдонҳоро пур кунед.');
    }

    //  барои дохил кардани маълумот ба базаи додаҳо
    const sql = `INSERT INTO employees (name, email, tell, adress, vazifa) VALUES (?, ?, ?, ?, ?)`;
    connection.query(sql, [name, email, tell, adress, vazifa], (error, result) => {
        if (error) {
            return res.send('Хатогӣ ҳангоми илова кардани сотрудник: ' + error.message);
        }
        res.redirect('/welcome');
    });
});

                     //дидани руйхат
app.get('/api/employees', (req, res) => {
    const sql = `SELECT * FROM employees`;
    connection.query(sql, (error, results) => {
        if (error) {
            return res.json({ success: false, message: 'Хатогӣ ҳангоми гирифтани маълумот: ' + error.message });
        }
        res.json({ success: true, data: results });
    });
});

             //хорич намудани кормандон
app.delete('/api/employees/:id', (req, res) => {
    const employeeId = req.params.id;

    // Намунаи ҳазфи корманд аз пойгоҳи додаҳо
    connection.query('DELETE FROM employees WHERE id = ?', [employeeId], (err, result) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Хатогӣ ҳангоми ҳазфи корманд.' });
        }
        res.json({ success: true, message: 'Корманд бо муваффақият ҳазф шуд.' });
    });
});

      //ивази вазифа
app.post('/update-employee-vazifa', (req, res) => {
    const { id, vazifa } = req.body;  // id ва вазифа ҳамчун параметрҳо

    // Санҷиши пуррагии параметрҳо
    if (!id || !vazifa) {
        return res.send('Лутфан ID ва вазифаро пур кунед.');
    }

    // SQL фармон барои навсозии вазифа
    const sql = `UPDATE employees SET vazifa = ? WHERE id = ?`;

    // Иҷрои фармон
    connection.query(sql, [vazifa, id], (error, result) => {
        if (error) {
            return res.send('Хатогӣ ҳангоми навсозии вазифа: ' + error.message);
        }
        if (result.affectedRows > 0) {
            // Пас аз навсозии вазифа, redirect ба саҳифаи welcome
            res.redirect('welcome');
        } else {
            res.send('Сотрудник бо ID муайяншуда ёфт нашуд.');
        }
    });
});

  //poisk
app.get('/search', (req, res) => {
    const query = req.query.query;

    if (!query) {
        return res.send('Пожалуйста, введите поисковый запрос.');
    }

    const sql = `SELECT * FROM employees WHERE name LIKE ? OR email LIKE ? OR tell LIKE ? OR adress LIKE ? OR vazifa LIKE ?`;
    connection.query(sql, [`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`], (error, results) => {
        if (error) {
            return res.send('Ошибка при выполнении поиска: ' + error.message);
        }

        res.json({ success: true, data: results });
    });
});


// Запуск сервера
app.listen(3000, () => {
    console.log('Сервер запущен на http://localhost:3000')
})