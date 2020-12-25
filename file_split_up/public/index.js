let btnFile = document.querySelector("#btnFile");
let chunkSize = 0.02 * 1024 * 1024; //每次0.2M


function upload(index) {
    console.log('index:', index);
    let file = btnFile.files[0];
    let [fname, fext] = file.name.split('.');
    let start = index * chunkSize;
    let blob = file.slice(start, start + chunkSize);
    console.log('start:', start, 'startChunkSize:', start + chunkSize)
    let blobName = `${fname}.${index}.${fext}`;
    let blobFile = new File([blob], blobName);
    if (start > file.size) {
        merge(file.name);
        return;
    }
    let formData = new FormData();
    formData.append('file', blobFile);

    axios.post('/upload', formData).then((res) => {
        upload(++index);
        console.log('web上传完成:', res.data)
    });
}

function merge(name) {
    axios.post('/merge', { name: name }).then((res) => {
        console.log(res.data)
    });
}

// test
// var arr="abcdefghigkl";

// function up(index){
// var start=index* 2
// var res=arr.slice(start,start+2)
// console.log(res)
// if(start>=arr.length-2){ console.log('start=',start) ;return}
// up(++index);
// }
// up(0)