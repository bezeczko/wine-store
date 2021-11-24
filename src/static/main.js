var mainPage = document.getElementById("wine-list");
var loginPage = document.getElementById("loginpage");
var basketPage = document.getElementById("basketpage")
var wineContainer = document.getElementById("wine-container");
var userPanel = document.getElementById("user-panel");
var orderConfirmation = document.getElementById("order-confirmation");

function mainpage_click() {
    loginPage.hidden = true;
    basketPage.hidden = true;
    wineContainer.hidden = true;
    userPanel.hidden = true;
    orderConfirmation.hidden = true;
    mainPage.hidden = false;
    
}

function login_click() {

    if(document.getElementById("loginButton").innerHTML == "Zaloguj/zarejestruj") {
        mainPage.hidden = true;
        basketPage.hidden = true;
        wineContainer.hidden = true;
        userPanel.hidden = true;
        orderConfirmation.hidden = true;
        loginPage.hidden = false;
    } else {
        localStorage.setItem("fastapi_auth", null);
        document.getElementById("loginButton").innerHTML = "Zaloguj/zarejestruj";
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
         login_click();
    } else {

        mainPage.hidden = true;
        loginPage.hidden = true;
        wineContainer.hidden = true;
        userPanel.hidden = true;
        orderConfirmation.hidden = true;
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
                        let nameP = document.createElement('p');
                        let name = document.createTextNode(response[i]["item"][0]["name"]);
                        nameP.appendChild(name);
                        nameP.alt = response[i]["item"][0]["id"];
                        nameP.onclick = showWineDetails;
                        nameP.classList = ['name-click'];
                        nameCell.appendChild(nameP);

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
            }, 
            error: function(jqXHR) {
                if (jqXHR.status === 401) {
                    alert("Sesja wygasła. Zaloguj się ponownie.");
                    login_click();
                    login_click();
                }
            }
        });
     }
 }

 function ib_addToBasket() {

    $.ajax({
        url: '/basket/',
        type: 'post',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify({
            item_id: this.alt
        }),
        beforeSend: function(xhr) {
            xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('fastapi_auth'));
        },
        success: function(response) {
            basket();
        },
        error: function() {
            alert('Wystąpił błąd');
        }
    });

 }

 function ib_removeFromBasket() {
     
    $.ajax({
        url: '/basket/',
        type: 'delete',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify({
            item_id: this.alt
        }),
        beforeSend: function(xhr) {
            xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('fastapi_auth'));
        },
        success: function(response) {
            basket();
        },
        error: function() {
            alert('Wystąpił błąd');
        }
    });

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
            },
            error: function(jqXHR) {
                if (jqXHR.status === 401) {
                    alert("Sesja wygasła. Zaloguj się ponownie.");
                    login_click();
                    login_click();
                }
            }
        });
    }
    
}

function order_details() {
    let order_details = document.getElementById("order-details-form");
    order_details.hidden = false;
}

function place_order() {
    $.ajax({
        url: '/basket/',
        type: 'get',
        beforeSend: function(xhr) {
            xhr.setRequestHeader('Authorization', "Bearer " + localStorage.getItem("fastapi_auth"));
        },
        success: function(response) {
            
            var items = [];

            for(var i=0; i<response.length; i++) {
                items.push({
                    "item": response[i]["item"][0]["id"],
                    "amount": response[i]["amount"]
                });
            }

            console.log(items);

            var city = $("#orderCity").val();
            var street = $("#orderStreet").val();
            var buildingNumber = $("#orderBuildingNumber").val();
            var contactNumber = $("#orderContactNumber").val();

            console.log(city);
            console.log(street);
            console.log(buildingNumber);
            console.log(contactNumber);

            $.ajax({
                url: '/order/',
                type: 'post',
                dataType: 'json',
                contentType: 'application/json',
                data: JSON.stringify({
                    order: {
                        "city": city,
                        "street": street,
                        "building_number": buildingNumber,
                        "contact_number": contactNumber
                    },
                    items_amount: items
                }),
                beforeSend: function(xhr) {
                    xhr.setRequestHeader('Authorization', "Bearer " + localStorage.getItem("fastapi_auth"));
                },
                success: function(response) {
                    console.log(response);

                    mainPage.hidden = true;
                    loginPage.hidden = true;
                    wineContainer.hidden = true;
                    basketPage.hidden = true;
                    userPanel.hidden = true;
                    orderConfirmation.hidden = false;

                    let orderConfirmationTable = document.getElementById("order-confirmation-table");
                    let newRow = orderConfirmationTable.insertRow(-1);
                    newRow.insertCell(0).appendChild(document.createTextNode("Numer zamówienia:"));
                    newRow.insertCell(1).appendChild(document.createTextNode(response["id"]));
                    newRow = orderConfirmationTable.insertRow(-1);
                    newRow.insertCell(0).appendChild(document.createTextNode("Status:"));
                    newRow.insertCell(1).appendChild(document.createTextNode(response["status"]));
                    newRow = orderConfirmationTable.insertRow(-1);
                    newRow.insertCell(0).appendChild(document.createTextNode("Numer kontaktowy:"));
                    newRow.insertCell(1).appendChild(document.createTextNode(response["contact_number"]));
                    newRow = orderConfirmationTable.insertRow(-1);
                    newRow.insertCell(0).appendChild(document.createTextNode("Miasto:"));
                    newRow.insertCell(1).appendChild(document.createTextNode(response["city"]));
                    newRow = orderConfirmationTable.insertRow(-1);
                    newRow.insertCell(0).appendChild(document.createTextNode("Ulica:"));
                    newRow.insertCell(1).appendChild(document.createTextNode(response["street"]));
                    newRow = orderConfirmationTable.insertRow(-1);
                    newRow.insertCell(0).appendChild(document.createTextNode("Numer budynku:"));
                    newRow.insertCell(1).appendChild(document.createTextNode(response["building_number"]));
                    newRow = orderConfirmationTable.insertRow(-1);
                    newRow.insertCell(0).appendChild(document.createTextNode("Wartość zamówienia:"));
                    newRow.insertCell(1).appendChild(document.createTextNode(response["total"]));

                }
            })
        }
    });
}

function user_panel() {

    if (localStorage.getItem("fastapi_auth") == "null") {
        alert("Musisz być zalogowany!");
        login_click();
    } else {
        mainPage.hidden = true;
        loginPage.hidden = true;
        wineContainer.hidden = true;
        basketPage.hidden = true;
        orderConfirmation.hidden = true;
        userPanel.hidden = false;

        $.ajax({
            url: '/orders/',
            type: 'get',
            beforeSend: function(xhr) {
                xhr.setRequestHeader('Authorization', "Bearer " + localStorage.getItem("fastapi_auth"));
            },
            success: function(response) {
                console.log(response);
            }
        });
    }
}

function showWineDetails() {
    console.log(this.alt);
    mainPage.hidden = true;
    loginPage.hidden = true;
    basketPage.hidden = true;
    orderConfirmation.hidden = true;
    wineContainer.hidden = false;

    $.ajax({
        url: '/wine/' + this.alt,
        type: 'get',
        success: function(response) {
            if (response!=0) {
                console.log(response)
                let wineName = document.getElementById("wine-container-name");
                wineName.innerHTML = response["name"];
                
                let wineDesc = document.getElementById("wine-container-desc");
                wineDesc.innerHTML = response["description"];

                let winePrice = document.getElementById("wine-container-price");
                winePrice.innerHTML = '<b>Cena: </b>' + response["price"] + ' zł';

                let wineBtn = document.getElementById("wine-container-basket-button");
                wineBtn.alt = response["id"];
                wineBtn.onclick = addToBasket;

                let wineDetailTable = document.getElementById("wine-container-table");
                let newRow = wineDetailTable.insertRow(-1);
                newRow.insertCell(0).appendChild(document.createTextNode("Kraj:"));
                newRow.insertCell(1).appendChild(document.createTextNode(response["country"]));
                newRow = wineDetailTable.insertRow(-1);
                newRow.insertCell(0).appendChild(document.createTextNode("Region:"));
                newRow.insertCell(1).appendChild(document.createTextNode(response["region"]));
                newRow = wineDetailTable.insertRow(-1);
                newRow.insertCell(0).appendChild(document.createTextNode("Kolor:"));
                newRow.insertCell(1).appendChild(document.createTextNode(response["color"]));
                newRow = wineDetailTable.insertRow(-1);
                newRow.insertCell(0).appendChild(document.createTextNode("Styl:"));
                newRow.insertCell(1).appendChild(document.createTextNode(response["style"]));
                
            }
        },
        error: function(jqXHR) {
            if (jqXHR.status === 401) {
                alert("Sesja wygasła. Zaloguj się ponownie.");
                login_click();
                login_click();
            }
        }
    });

    // let wineName = document.getElementById("wine-container-name");
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
                    let nameP = document.createElement('p');
                    let name = document.createTextNode(response[i]["name"]);
                    nameP.appendChild(name);
                    nameP.alt = response[i]["id"];
                    nameP.onclick = showWineDetails;
                    nameP.classList = ['name-click'];
                    nameCell.appendChild(nameP);
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
        document.getElementById("loginButton").innerHTML = "Zaloguj/zarejestruj";
    }
    
    load_wines();

});