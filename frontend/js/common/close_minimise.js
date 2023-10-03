var fermer = document.getElementById('close')

fermer.addEventListener("click",function () {ipc.send("close_app", "")})
