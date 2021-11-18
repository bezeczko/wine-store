$(document).ready(function() {
    
    var wineTableBody = document.getElementById("wine-table");

    $.ajax({
        url: '/wines',
        type: 'get',
        success: function(response) {
            if(response != 0) {
                console.log(response);    
                
                for(var i=0; i<response.length; i++) {
                    let newRow = wineTableBody.insertRow(-1);
                    let nameCell = newRow.insertCell(0);
                    let nameLink = document.createElement("a");
                    let name = document.createTextNode(response[i]["name"]);
                    nameLink.appendChild(name);
                    nameLink.href = "/showwine/"+response[i]["id"];
                    nameCell.appendChild(nameLink);
                    let priceCell = newRow.insertCell(1);
                    let price = document.createTextNode(response[i]["price"]);
                    priceCell.appendChild(price);
                }
            } else {
                console.log("Something went wrong");
            }
        }
    });

});