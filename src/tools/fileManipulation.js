import React from "react";


function uploadFile(e) {
    let form = new FormData();
    form.append('file', e.files[0]);
    axios({
            method: 'post',
            url: 'https://127.0.0.1/data',
            data: form
        })
}


fetch(`url?arg=${arg}`)
     .then(resp => resp.blob())
     .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = "filename.xlsx";
        a.click();
 })