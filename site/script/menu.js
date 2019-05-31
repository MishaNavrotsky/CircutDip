document.addEventListener("DOMContentLoaded", function () {
    $("#newScheme").on("click", function newWindow() {
        window.open("/");
    })
    $("#LogOut").on("click", function logOut() {
        $.post({
            url: "/logout",
            type: "POST",
            data: {
                status: "OK"
            }
        }).done(function () {
            document.location.reload();
        })
    })
    $.ajax({
        url: "/allSchemes"
    }).done(function showSchemes(data) {

        function addZero(data){
            str = data + "";
            if(str.length<2){
                str = "0"+data;
            }
            return str;
        }
        console.log(data);
        for (let i = 0; i < data.length; i++) {
            var lastUpdate = new Date(data[i].lastUpdate);
            var str = "";
            str+=addZero(lastUpdate.getHours()) + ":";
            str+=addZero(lastUpdate.getMinutes()) + ":";
            str+=addZero(lastUpdate.getSeconds()) + " ";
            str+=addZero(lastUpdate.getDate()) + "-";
            str+=addZero(lastUpdate.getMonth()+1) + "-";
            str+=lastUpdate.getFullYear();



            var div = $("<div class='menuElement'></div>");
            var toolbar = $("<div class='elToolbar'>"+data[i].name+"\t(Last Update: "+ str +")</div>")            
            var butDelete = $("<button class='btnDelete'>Delete</button>");
            var butRename = $("<button class='btnDelete'>Rename</button>");
            div.append(toolbar);
            toolbar.append(butDelete);
            toolbar.append(butRename);

            console.log(new Date(data[i].lastUpdate));
            toolbar.on("click", function () {
                window.open(data[i].url.split("/")[2])
            });
            butDelete.on("click", function deleteScheme(e) {
                e.stopPropagation();
                $.post({
                    url: "/deleteScheme",
                    type: "POST",
                    data: {
                        url: data[i].url
                    }
                }).done(function () {
                    document.location.reload();
                })
            })

            butRename.on("click", function schemeNameChange(e) {
                e.stopPropagation();
                var newName = prompt("New Name:");
                if(!newName) return;
                var json = {
                    name:newName,
                    url: data[i].url
                }
                $.post({
                    url: "/changeName",
                    type: "POST",
                    data: json
                }).done(function reloadPage() {
                    document.location.reload();
                })
            })
            $(".menu").append(div);
        }
    });
});