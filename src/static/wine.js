$(document).ready(function() {
    
    var wineTableBody = document.getElementById("wine-table");
    var wineID = window.location.href.split("/")[4];
    var wineError = document.getElementById("wine-error");

    $.ajax({
        
        url: '/wine/'+wineID,
        type: 'get',
        success: function(response) {
            if(response != 0) {            
                let newRow = wineTableBody.insertRow(-1);
                let nameCell = newRow.insertCell(0);
                nameCell.appendChild(document.createTextNode("Nazwa"));
                nameCell = newRow.insertCell(1);
                nameCell.appendChild(document.createTextNode(response["name"]));

                newRow = wineTableBody.insertRow(-1);
                let priceCell = newRow.insertCell(0);
                priceCell.appendChild(document.createTextNode("Cena"));
                priceCell = newRow.insertCell(1);
                priceCell.appendChild(document.createTextNode(response["price"]));

                newRow = wineTableBody.insertRow(-1);
                let descCell = newRow.insertCell(0);
                descCell.appendChild(document.createTextNode("Opis"));
                descCell = newRow.insertCell(1);
                descCell.appendChild(document.createTextNode(response["description"]));

                newRow = wineTableBody.insertRow(-1);
                let countryCell = newRow.insertCell(0);
                countryCell.appendChild(document.createTextNode("Kraj pochodzenia"));
                countryCell = newRow.insertCell(1);
                countryCell.appendChild(document.createTextNode(response["country"]));

                newRow = wineTableBody.insertRow(-1);
                let regionCell = newRow.insertCell(0);
                regionCell.appendChild(document.createTextNode("Region"));
                regionCell = newRow.insertCell(1);
                regionCell.appendChild(document.createTextNode(response["region"]));

                newRow = wineTableBody.insertRow(-1);
                let colorCell = newRow.insertCell(0);
                colorCell.appendChild(document.createTextNode("Kolor"));
                colorCell = newRow.insertCell(1);
                colorCell.appendChild(document.createTextNode(response["color"]));

                newRow = wineTableBody.insertRow(-1);
                let styleCell = newRow.insertCell(0);
                styleCell.appendChild(document.createTextNode("Styl"));
                styleCell = newRow.insertCell(1);
                styleCell.appendChild(document.createTextNode(response["style"]));

            } else {
                console.log("Something went wrong");
            }
        },
        error: function() {
            wineError.hidden = false;
            wineError.innerHTML = "Wino o ID = " + wineID + " nie zostało znalezione";
        }
    });

});