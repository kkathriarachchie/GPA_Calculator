const gradeOptions = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'E']; // Example grade options
const gradePoint = [4.0, 4.0, 3.7, 3.3, 3.0, 2.7, 2.3, 2.0, 1.7, 1.3, 1.0, 0.0]; 

$('#view-scrn').hide();
const templateList = $('#template-list');

const firebaseConfig = {
  apiKey: "AIzaSyBtcVJ9uK5ACKO-eHL3-S7kS75QNkjBRsA",
  authDomain: "login-screen-c5e85.firebaseapp.com",
  databaseURL: "https://login-screen-c5e85-default-rtdb.firebaseio.com",
  projectId: "login-screen-c5e85",
  storageBucket: "login-screen-c5e85.appspot.com",
  messagingSenderId: "562075370837",
  appId: "1:562075370837:web:f0cbae46bd47b7b256dbdc",
  measurementId: "G-Q8GQ267WM9"
};

firebase.initializeApp(firebaseConfig);

function listTemplates() {

  templateList.html('');

  // Reference to the Firestore collection
  const collectionRef = firebase.firestore().collection('gpa-templates');

  // Get all documents from the collection
  collectionRef.get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        const documentData = doc.data();
        const documentId = doc.id;

        //console.log('Document ID:', documentId);
        //console.log('Document Data:', documentData);


        const item = $('<div>').addClass('item').data('doc-id', doc.id).data('doc-name', documentData.name).data('doc-batch', documentData.batch);
        const content = $('<div>');

        const name = $('<h1>').text(documentData.name);
        const batch = $('<p>').text(documentData.batch);

        const button = $('<button>');
        const buttonText = $('<h4>').html('&nbspUSE&nbsp;&nbsp;<i class="fa-solid fa-caret-right"></i>');



        button.append(buttonText);
        content.append(name, batch);
        item.append(content, button);

        templateList.append(item);

        $('#popup').fadeOut();
        $('#popup').html(``);


      });
    })
    .catch((error) => {
      console.error('Error getting documents:', error);

      $('#popup').html(`<div><h2>An error ocurred. Please try again.</h2><button id="close-popup"><i class="fa-solid fa-xmark"></i></button></div>`);
      $('#popup').fadeIn();
      
      $("#close-popup").click(function () {
        $('#popup').fadeOut();
        $('#popup').html('');
      });
    });

}

listTemplates();

$('#popup').html(`<div class="lds-hourglass"></div>`);
$('#popup').show();


// Assuming you have already populated the #template-list element

// Add click event listener to "USE" buttons
templateList.on('click', '.item button', function () {
  const itemId = $(this).closest('.item').data('doc-id');
  const itemName = $(this).closest('.item').data('doc-name');
  const itemBatch = $(this).closest('.item').data('doc-batch');

  // Call your function with the document ID
  useTemplate(itemId, itemName, itemBatch);
});

const table = $('#module-table');

// Your function to handle using a template
function useTemplate(documentId, name, batch) {



  $('#popup').html(`<div class="lds-hourglass"></div>`);
  $('#popup').fadeIn();

  $('#selected-template-name').text(name);
  $('#selected-template-batch').text(batch);

  //console.log('Using template with ID:', documentId);
  $('#search-scrn').hide();
  $('#view-scrn').fadeIn();

  // Reference to the table element
  table.html('');

  // Create the table header row
  const headerRow = $('<tr>');
  const headers = ['Module Name', 'Module Code', 'Credit', 'Grade', 'Credit Point'];

  headers.forEach((header) => {
    headerRow.append($('<th>').text(header));
  });

  table.append(headerRow);

  const collectionRef = firebase.firestore().collection('gpa-templates').doc(documentId).collection('modules');

  // Get all documents from the collection
  collectionRef.orderBy('credit', 'desc').get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        const documentData = doc.data();
        const documentId = doc.id;

        //console.log('Document ID:', documentId);
        //console.log('Document Data:', documentData);

        const row = $('<tr>');

        const moduleName = $('<td>').text(documentData.name);
        const moduleCode = $('<td>').text(documentData.code);
        const moduleCredit = $('<td>').addClass('credit').text(documentData.credit);

        const gradeSelect = $('<select>').addClass('grade-select');

        // Add initial "Please select" option
        gradeSelect.append($('<option>').text('Select'));

        // Populate grade options
        gradeOptions.forEach((grade) => {
          gradeSelect.append($('<option>').text(grade));
        });

        const gradeCell = $('<td>').append(gradeSelect);

        const creditPointCell = $('<td>').addClass('credit-point');

        gradeSelect.change(function () {
          const selectedGrade = gradeSelect.val();
          const selectedCredit = parseFloat(moduleCredit.text());
          const gradeIndex = gradeOptions.indexOf(selectedGrade);

          if (!isNaN(selectedCredit) && gradeIndex !== -1) {
            const creditPoint = selectedCredit * gradePoint[gradeIndex];
            creditPointCell.text(creditPoint.toFixed(2));
          } else {
            creditPointCell.text('');
          }
        });

        row.append(moduleName, moduleCode, moduleCredit, gradeCell, creditPointCell);
        table.append(row);

      });

      $('#popup').fadeOut();
      $('#popup').html(``);

    })
    .catch((error) => {
      console.error('Error getting documents:', error);

      $('#popup').html(`<div><h2>An error ocurred. Please try again.</h2><button id="close-popup"><i class="fa-solid fa-xmark"></i></button></div>`);
      $('#popup').fadeIn();

      $("#close-popup").click(function () {
        $('#popup').fadeOut();
        $('#popup').html('');
      });

    });

  // Implement your logic to use the template here
}


function calculateTotalCredits() {

  const table = $('#module-table');
  const rows = table.find('tr'); // Get all rows in the table

  let totalCredits = 0;

  // Loop through rows (skip header row)
  for (let i = 1; i < rows.length; i++) {
    const row = $(rows[i]);
    const creditCell = row.find('td.credit'); // Assuming you have a class "credit" on the credit cell

    if (creditCell.length) {
      const credit = parseFloat(creditCell.text());
      if (!isNaN(credit)) {
        totalCredits += credit;
      }
    }
  }

  return totalCredits;
}

function calculateTotalCreditPoints() {
  
  const table = $('#module-table');
  const rows = table.find('tr'); // Get all rows in the table

  let totalCreditPoints = 0.0;

  // Loop through rows (skip header row)
  for (let i = 1; i < rows.length; i++) {
    const row = $(rows[i]);
    const creditCell = row.find('td.credit-point'); // Assuming you have a class "credit" on the credit cell

    if (creditCell.length) {
      const credit = parseFloat(creditCell.text());
      if (!isNaN(credit)) {
        totalCreditPoints += credit;
      }
    }
  }

  return totalCreditPoints;
}



$("#calc-gpa").click(function () {


  const allGradesSelected = $('.grade-select').toArray().every(select => $(select).val() !== 'Select');

  if (!allGradesSelected) {
    //alert("Please select grades for all modules.");
    $('#popup').html(`<div><h2>Please select grades for all modules&nbsp;&nbsp;<i class="fa-solid fa-hand-pointer"></i></h2><button id="close-popup"><i class="fa-solid fa-xmark"></i></button></div>`);
    $('#popup').fadeIn();

    $("#close-popup").click(function () {
      $('#popup').fadeOut();
      $('#popup').html('');
    });
    return; // Exit the function early if not all grades are selected
    
  }

  // Example usage
  const totalCredits = calculateTotalCredits();
  //console.log('Total Credits:', totalCredits);

  const totalCreditPoints = calculateTotalCreditPoints();

  if (totalCredits === 0) {
    alert("Total Credits cannot be zero.");
    $('#popup').html(`<div><h2>Total credits cannot be zero.</h2><button id="close-popup"><i class="fa-solid fa-xmark"></i></button></div>`);
    $('#popup').fadeIn();
  } else {
    const gpa = totalCreditPoints / totalCredits;
    $('#popup').html(`<div><h2>Your total GPA for the selected semester is<br><h1>`+gpa.toFixed(2)+`</h1></h2><button id="close-popup"><i class="fa-solid fa-xmark"></i></button></div>`);
    $('#popup').fadeIn();
  }
  $("#close-popup").click(function () {
    $('#popup').fadeOut();
    $('#popup').html('');
  });

});


$("#go-back-btn").click(function () {
  $('#search-scrn').fadeIn();
  $('#view-scrn').hide();

});

$('#search').on('input', function () {
  const searchText = $(this).val().toLowerCase();
  
  $('.item').each(function () {
    const itemName = $(this).find('h1').text().toLowerCase();
    const itemBatch = $(this).find('p').text().toLowerCase();

    if (itemName.includes(searchText) || itemBatch.includes(searchText)) {
      $(this).show();
    } else {
      $(this).hide();
    }
  });
});