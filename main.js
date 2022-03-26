//Display Constants
let dispStartIndex = 0;
let recordsPerPage = 10;
let allTableRecords = "";
let currentTableRecords = "";

loadFile();

//Load the file and display the results.
function loadFile() {
    const xhttp = new XMLHttpRequest();
    xhttp.onload = function() {
        allTableRecords = processData(xhttp.responseText);
        currentTableRecords=allTableRecords;
        writeToTable(allTableRecords, recordsPerPage, 0);
    }
    
    xhttp.open("GET", "data.txt", true);
    xhttp.send();
}

//Convert csv data into array of row objects.
function processData(text) {
    const lineArray = text.split("\n");
    const entries = [];
    for(var i=1; i < lineArray.length; i++) {
        let entry=lineArray[i].split(",");
        let povRate = parseFloat(entry[6]) / parseFloat(entry[5]) * 100;
        povRate = isNaN(povRate) ? 0.0 : povRate;
        povRate = povRate.toFixed(2) + "%";
        entries[i-1] = {state:entry[0], fips:entry[1], distId:entry[2], name:entry[3], pop: entry[4], schlPop:entry[5], povPop:entry[6], povRate:povRate};
    }
    return entries;
}

//Write the rows to the table. Show only so many records per page
function writeToTable(rows, recordsPerPage, startIndex) {
    let tableHTML = "";
    let endIndex = startIndex + recordsPerPage;
    for(var i = startIndex; i < endIndex && i < rows.length; i++) {
        let x = rows[i];
        tableHTML += `<tr><td>${x.state}</td><td>${x.fips}</td>
                        <td>${x.distId}</td><td>${x.name}</td>
                        <td>${x.pop}</td><td>${x.schlPop}</td>
                        <td>${x.povPop}</td><td>${x.povRate}</td>
                        </tr> \n`;
    }
    
    document.getElementById("data-table-body").innerHTML=tableHTML;
}

//Advance the displayed page.
function nextPage() {
    if (dispStartIndex + recordsPerPage < currentTableRecords.length) {
        writeToTable(currentTableRecords, recordsPerPage, dispStartIndex += recordsPerPage);
    }
}

//Decrement the displayed page.
function prevPage() {
    writeToTable(currentTableRecords, recordsPerPage, dispStartIndex = Math.max(dispStartIndex - recordsPerPage, 0));
}

//Update the number of records displayed in the table.
function updateTableSize() {
    recordsPerPage = parseInt(document.getElementById("disp-size").value);
    writeToTable(currentTableRecords, recordsPerPage, dispStartIndex);
}

//Sort the search results (or all records if not searched) by the given column.
function sort(column) {
    currentTableRecords = currentTableRecords.sort(getSortCallBack(column));
    writeToTable(currentTableRecords, recordsPerPage, 0);
}

function getSortCallBack(column) {
    const searchFunctions = [(a,b) => a.state.localeCompare(b.state),
                             (a,b) => a.fips - b.fips,
                             (a,b) => a.distId - b.distId,
                             (a,b) => a.name.localeCompare(b.name),
                             (a,b) => a.pop - b.pop,
                             (a,b) => a.schlPop - b.schlPop,
                             (a,b) => a.povPop - b.povPop,
                             (a,b) => parseFloat(a.povRate) - parseFloat(b.povRate)];
    
    return searchFunctions[column];
}

//Search for and display records according to query specified in html form.
function searchDisplay() {
    const scope=document.getElementById("search-scope").value;
    const column=document.getElementById("search-column").value;
    const searchVal=document.getElementById("searchfor").value;
    
    const searchCallBack = getSearchCallBack(column, scope, searchVal);
    currentTableRecords = allTableRecords.filter(searchCallBack);
    writeToTable(currentTableRecords,recordsPerPage,0);
}

function getSearchCallBack(column, mode, ident) {
    const searchModes = [(currentValue) => currentValue[column]==ident,
                         (currentValue) => currentValue[column].includes(ident), 
                         (currentValue) => !currentValue[column].includes(ident),
                         (currentValue) => currentValue[column] > ident, 
                         (currentValue) => currentValue[column] < ident];
    
    return searchModes[mode];
}