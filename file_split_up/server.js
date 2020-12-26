const express = require('express');
const bodyParser = require('body-parser'); //？？请求体？
const multiparty = require('multiparty'); //文件上传
const fse = require("fs-extra") //文件处理
const path = require('path')

const app = express();
var serverStatic = express.static(__dirname + "/public");
// 指定静态资源路径
app.use(serverStatic);
// 解析中间件
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json());
// console.log(temp);
const UPLOAD_DIR = path.resolve(__dirname, "public/upload");
app.post('/upload', function(req, res) {
    console.log('come in ')
    const form = new multiparty.Form({ uploadDir: "temp" })
    form.parse(req);
    console.log(req)
    form.on('file', async(name, chunk) => {
            console.log('file-name:', name, 'file-chunk:', chunk)
            console.log('chunk.org..Name', chunk.originalFilename);
            //存放切片的目录
            let chunkDir = `${UPLOAD_DIR}/${chunk.originalFilename.split('.')[0]}`;
            console.log('chunkDir:', chunkDir)
            if (!fse.existsSync(chunkDir)) {
                await fse.mkdirs(chunkDir);
            }
            var dPath = path.join(chunkDir, chunk.originalFilename.split('.')[1]);
            console.log('dPath:', dPath);
            console.log('chunk.path:', chunk.path);
            await fse.move(chunk.path, dPath, { overwrite: true })
            res.send('服务端说：上传文件成功')
        })
        // res.send('服务端说：the all 上传文件成功')

});
app.get('/test', function(req, res) {
    console.log(req.query)
    res.send('ok');
})
app.post('/merge', async(req, res) => {
    console.log('merge:ing')
    let name = req.body.name;
    let fname = name.split('.')[0];
    let chunkDir = path.join(UPLOAD_DIR, fname);

    let chunks = await fse.readdir(chunkDir)
    chunks.sort((a, b) => { a - b }).map(chunkPath => {
        // 合并文件
        fse.appendFileSync(path.join(UPLOAD_DIR, name), fse.readFileSync(`${chunkDir}/${chunkPath}`));
    })

    fse.removeSync(chunkDir);
    res.send({ msg: "合并成功", url: `localhost://3000/upload/${name}` });

})

app.listen(3000);