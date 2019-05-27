document.addEventListener("DOMContentLoaded", function () {
    $("#newScheme").on("click", function () {
        window.open("/");
    })
    $("#LogOut").on("click", function () {
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
    }).done(function (data) {
        console.log(data);
        for (let i = 0; i < data.length; i++) {
            var div = $("<div class='menuElement'></div>");
            var toolbar = $("<div class='elToolbar'>"+data[i].name+"</div>")
            var butDelete = $("<button class='btnDelete'>Delete</button>");
            var butRename = $("<button class='btnDelete'>Rename</button>");
            div.append(toolbar);
            toolbar.append(butDelete);
            toolbar.append(butRename);

            console.log(data[i].url)
            toolbar.on("click", function () {
                window.open(data[i].url.split("/")[2])
            });
            butDelete.on("click", function (e) {
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

            butRename.on("click", function (e) {
                e.stopPropagation();
                var newName = prompt("New Name:");
                var json = {
                    name:newName,
                    url: data[i].url
                }
                $.post({
                    url: "/changeName",
                    type: "POST",
                    data: json
                }).done(function () {
                    document.location.reload();
                })
            })
            $(".menu").append(div);
        }
    });
});