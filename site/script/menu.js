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
        for (let i = 0; i < data.length; i++) {
            var div = $("<div class='menuElement'></div>");
            var toolbar = $("<div class='elToolbar'>" + data[i].url + "</div>")
            var butDelete = $("<button class='btnDelete'>Delete</button>");
            div.append(toolbar);
            toolbar.append(butDelete);
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
            $(".menu").append(div);
        }
    });
});