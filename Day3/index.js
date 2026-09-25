let cardholder = document.getElementById("cardHolder");
let cardNumber = document.getElementById("cardNumber");
let expireyear = document.getElementById("expYear");
let expiremonth = document.getElementById("expMonth");
let submitbtn = document.getElementById("submit");
let tableCard = document.getElementById("cardData-table");

let cvv = document.getElementById("cvv");

const tableData = {};

function handelSubmit(e) {
  let holdername = cardholder.value;
  let number = cardNumber.value;
  let date = expiremonth.value + expireyear.value;
  let cvvnum = cvv.value;

  let trowData = `
<td>${holdername}</td>
<td>${number}</td>
<td>${date}</td>
<td>${cvvnum}</td>
`;
  return trowData;
}

submitbtn.addEventListener("click", (e) => {
  e.preventDefault();
  const tr = document.createElement("tr");
  let data = handelSubmit();
  tr.innerHTML = data;
  tableCard.append(tr);
});
