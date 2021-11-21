var mainPage = document.getElementById("wine-list");
var loginPage = document.getElementById("loginpage");
var basketPage = document.getElementById("basketpage")

function mainpage_click() {
    loginPage.hidden = true;
    basketPage.hidden = true;
    mainPage.hidden = false;
}

function login_click() {

    if(document.getElementById("loginButton").innerHTML == "Zaloguj") {
        mainPage.hidden = true;
        basketPage.hidden = true;
        loginPage.hidden = false;
    } else {
        localStorage.setItem("fastapi_auth", null);
        document.getElementById("loginButton").innerHTML = "Zaloguj";
    }  

}

function login() {
     
    loginValue = $("#loginEmailInput").val();
    passwordValue = $("#loginPasswordInput").val();

    $.ajax({
        url: '/login/',
        type: 'post',
        dataType: "json",
        contentType: "application/json",
        data: JSON.stringify({
            username: loginValue,
            password: passwordValue
        }),
        success: function(response){
            if(response != 0) {
                localStorage.setItem("fastapi_auth", response["token"]);
                document.getElementById("loginButton").innerHTML = "Wyloguj";
                mainpage_click();  
            }
        },
        error: function(response) { 
            if (response["responseJSON"]["detail"] == "Invalid username and/or password") {
                alert("Email lub hasło nie zgadzają się");
            }
        }
    });
 }

 function register() {

    loginValue = $("#loginEmailInput").val();
    passwordValue = $("#loginPasswordInput").val();

    $.ajax({
        url: '/register/',
        type: 'post',
        dataType: "json",
        contentType: "application/json",
        data: JSON.stringify({
            username: loginValue,
            password: passwordValue
        }),
        success: function(response){
            if(response != 0) {
                alert("Pomyślnie zarejestrowano " + response["username"]);
            } else {
                alert('Error!');
            }
        },
        error: function(response) { 
            if (response["responseJSON"]["detail"] == "Email already registered") {
                alert("Email jest już w użyciu!");
            }
        } 
    });

 }

 function basket() {
    
    if (localStorage.getItem("fastapi_auth") == "null") {
         alert("Musisz być zalogowany!");
    } else {

        mainPage.hidden = true;
        loginPage.hidden = true;
        basketPage.hidden = false;

        var basketTable = document.getElementById("basket-table").getElementsByTagName("tbody")[0];
        $("#basket-table > tbody > tr").remove();

        $.ajax({
            url: '/basket/',
            type: 'get',
            beforeSend: function(xhr) {
                xhr.setRequestHeader('Authorization', "Bearer " + localStorage.getItem("fastapi_auth"));
            },
            success: function(response) {
                // console.log(response[0]["item"][0]["name"]);
                if (response != 0) {

                    var total = 0;

                    for(var i=0; i<response.length; i++) {
                        let newRow = basketTable.insertRow(-1);
                        let nameCell = newRow.insertCell(0);
                        let nameLink = document.createElement("a");
                        let name = document.createTextNode(response[i]["item"][0]["name"]);
                        nameLink.appendChild(name);
                        nameLink.href = "/showwine/" + response[i]["item"][0]["id"];
                        nameCell.appendChild(nameLink);

                        let priceCell = newRow.insertCell(1);
                        let price = document.createTextNode(response[i]["item"][0]["price"] + " zł");
                        priceCell.appendChild(price);

                        let amountCell = newRow.insertCell(2);
                        let amount = document.createTextNode(response[i]["amount"]);
                        amountCell.appendChild(amount);

                        let totalRowCell = newRow.insertCell(3);
                        let totalRow = document.createTextNode(parseFloat(response[i]["amount"]) * parseFloat(response[i]["item"][0]["price"]) + " zł");
                        totalRowCell.appendChild(totalRow);

                        let addToBasketCell = newRow.insertCell(4);
                        let addToBasket = document.createElement('img');
                        addToBasket.src = "/static/plus-square-regular.svg";
                        addToBasket.alt = response[i]["item"][0]["id"];
                        addToBasket.width = "20";
                        addToBasket.height = "20";
                        addToBasket.classList = ["addToBasket"];
                        addToBasket.onclick = ib_addToBasket;
                        addToBasketCell.append(addToBasket);

                        let removeFromBasketCell = newRow.insertCell(4);
                        let removeFromBasket = document.createElement('img');
                        removeFromBasket.src = "/static/minus-square-regular.svg";
                        removeFromBasket.alt = response[i]["item"][0]["id"];
                        removeFromBasket.width = "20";
                        removeFromBasket.height = "20";
                        removeFromBasket.classList = ["addToBasket"];
                        removeFromBasket.onclick = ib_removeFromBasket;
                        removeFromBasketCell.append(removeFromBasket);
                        
                        total += parseFloat(response[i]["amount"]) * parseFloat(response[i]["item"][0]["price"]);
                    }

                    let newRow = basketTable.insertRow(-1);
                    newRow.insertCell(0);
                    newRow.insertCell(1);
                    newRow.insertCell(2);
                    newRow.insertCell(3);
                    let totalTitleRow = newRow.insertCell(4);
                    let totalTitle = document.createTextNode("W sumie:");
                    totalTitleRow.appendChild(totalTitle);

                    let totalRow = newRow.insertCell(5);
                    let total_price = document.createTextNode(total + " zł");
                    totalRow.appendChild(total_price);

                }
            }
        });
     }
 }

 function ib_addToBasket() {
     console.log("Add to basket" + this.alt);
 }

 function ib_removeFromBasket() {
     console.log("Remove from basket" + this.alt);
 }

 function addToBasket() {
    
    if (localStorage.getItem("fastapi_auth") == "null") {
        alert("Musisz być zalogowany!");
    } else {
        $.ajax({
            url: '/basket/',
            type: 'post',
            dataType: 'json',
            contentType: 'application/json',
            data: JSON.stringify({
                item_id: this.alt
            }),
            beforeSend: function(xhr) {
                xhr.setRequestHeader('Authorization', "Bearer " + localStorage.getItem("fastapi_auth"));
            },
            success: function(response) {
                alert("Pomyślnie dodano " + response["item"][0]["name"] + " do koszyka");
            }
        });
    }
    

 }

function load_wines() {
    var wineTableBody = document.getElementById("wine-table").getElementsByTagName('tbody')[0];
    $("#wine-table > tbody > tr").remove();
    $.ajax({
        url: '/wines',
        type: 'get',
        success: function(response) {
            if(response != 0) {                
                for(var i=0; i<response.length; i++) {
                    let newRow = wineTableBody.insertRow(-1);
                    let nameCell = newRow.insertCell(0);
                    let nameLink = document.createElement("a");
                    let name = document.createTextNode(response[i]["name"]);
                    nameLink.appendChild(name);
                    nameLink.href = "/showwine/"+response[i]["id"];
                    nameCell.appendChild(nameLink);
                    let priceCell = newRow.insertCell(1);
                    let price = document.createTextNode(response[i]["price"] + " zł");
                    priceCell.appendChild(price);
                    let basketCell = newRow.insertCell(2);
                    let basketImg = document.createElement('img');
                    basketImg.src = "/static/cart-plus-solid.svg";
                    basketImg.alt = response[i]["id"];
                    basketImg.width = "20";
                    basketImg.height = "20";
                    basketImg.classList = ["addToBasket"];
                    basketImg.onclick = addToBasket;
                    basketCell.append(basketImg);


                }
            }
        }
    });
}

$(document).ready(function() {
    
    if(localStorage.getItem("fastapi_auth") != "null") {
        document.getElementById("loginButton").innerHTML = "Wyloguj";
    } else {
        document.getElementById("loginButton").innerHTML = "Zaloguj";
    }
    
    load_wines();

});