var q = 1; // NUMBERING THE QUEUE

// ADD ROWS FROM LOCALSTORAGE WHEN PAGE READY
$(document).ready(() => {
  // LOOPING THE LOCALSTORAGE
  while (q <= localStorage.length) {
    let patientName = capitalize(localStorage[q].split(",")[0]); // GET NAME FROM LOCALSTORAGE
    let status = localStorage[q].split(",")[1]; // GET STATUS FROM LOCALSTORAGE

    addRow(patientName, status); // ADD ROW FROM LOCALSTORAGE
    q++; // INCREMENT THE QUEUE EVERY LOOP
  }
});

$("#inputButton").on("click", () => patientInput()); // INPUT WITH MOUSE CLICK
$("#patientInput").on("keypress", (e) => (e.which == 13 ? patientInput() : "")); // INPUT WITH ENTER

// DATE
const month = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
const date = new Date();
$("#date").append(` ${date.getDate()} ${month[date.getMonth()]} ${date.getFullYear()}`);

// COPY BUTTON
$("#copyButton").on("click", function () {
  $("thead").remove(); // REMOVE TABLE HEAD
  $("tr").each(function () {
    // REMOVE UNNECESSARY TD
    $(this).children("td:eq(0)").remove();
    $(this).children("td:eq(1)").remove();
    $(this).children("td:eq(1)").remove();
    $(this).children("td:eq(1)").remove();
    $(this).children("td:eq(0)").css("width", "200%"); // MAKE THE NAME COLUMN LONGER
    $("table").css("width", "fit-content"); // MAKE THE TABLE WIDTH SHORTER
  });

  // ASSIGN CLIPBOARD.JS TO COPY BUTTON
  new ClipboardJS("#copyButton").on("success", (e) => {
    notification("Patient data copied to clipboard", "success"); // COPIED NOTIFICATION
    e.clearSelection();
  });
  setTimeout(() => location.reload(), 3000); // RELOAD THE PAGE AFTER 3 SECONDS TO MAKE THE TABLE NORMAL
});

// DELETE ALL BUTTON
$("#deleteAllButton").on("click", function () {
  // SWEETALERT2 CONFIRM DIALOG
  Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Yes, delete all!",
    cancelButtonText: "Cancel",
  }).then((result) => {
    // IF CONFIRMED
    if (result.isConfirmed) {
      $("#records tr").remove(); // REMOVE ALL ROWS
      localStorage.clear(); // CLEAR THE LOCALSTORAGE
      q = 1; // SET THE QUEUE BACK TO 1
      notification("All patient has been deleted", "danger"); // DELETE NOTIFICATION
    }
  });
});

// STATUS COLUMN
$("#records").on("click", ".statusCol > *", function () {
  // DISABLE ON CLICK, UN-DISABLE OTHER
  $(this).siblings().attr("disabled", false);
  $(this).attr("disabled", true);

  let row = $(this).parents("tr"); // CURRENT ROW
  let queue = row.find(".qCol").text(); // QUEUE NUMBER
  let name = row.find(".nameCol").text(); // PATIENT NAME

  localSave(queue, name, $(this).attr("name")); // UPDATE STATUS ON LOCALSTORAGE

  // IF THE "DONE" BUTTON CLICKED, APPEND CHECKLIST ON NAME COLUMN, ELSE REMOVE CHECKLIST
  if ($(this).attr("name") != "Done") row.find(".nameCol i").remove();
  else row.find(".nameCol").append('<i class="fa-solid fa-check fa-lg"></i>');
});

// MOVE COLUMN
$("#records").on("click", ".moveCol > *", function () {
  let row = $(this).closest("tr"); // CURRENT ROW
  let queueCol = row.find(".qCol"); // CURRENT QUEUE COLUMN
  let firstRow = queueCol.text() == 1; // FIRST ROW CHECK
  let lastRow = queueCol.text() == localStorage.length; // LAST ROW CHECK

  if ($(this).hasClass("upButton") && !firstRow) moveUp(row, queueCol); // UP BUTTON AND NOT FIRST ROW
  if ($(this).hasClass("downButton") && !lastRow) moveDown(row, queueCol); // DOWN BUTTON AND NOT LAST ROW
});

// ACTION COLUMN
$("#records").on("click", ".actionCol > *", function () {
  let row = $(this).closest("tr"); // CURRENT ROW
  let nameColumn = $(this).parents("tr").find(".nameCol"); // CURRENT NAME COLUMN
  let oldName = nameColumn.text(); // GET OLD NAME

  // EDIT BUTTON
  if ($(this).hasClass("editButton")) {
    let queue = $(this).parents("tr").find(".qCol").text(); // QUEUE NUMBER
    let status = localStorage.getItem(queue).split(",")[1]; // GET STATUS

    // REPLACE NAME COLUMN WITH INPUT ELEMENT AND FOCUS ON THE INPUT
    nameColumn.replaceWith(`<td class="nameCol"><input type="text" class="editInput" value="${oldName}"></td>`);
    $(".editInput").select();

    // EVERY KEYBOARD PRESS ON THE EDIT INPUT
    $(".editInput").on("keyup", function (e) {
      let changedName = capitalize($(this).val()); // GET THE VALUE ON THE INPUT

      // IF "ENTER" IS PRESSED
      if (e.key == "Enter") {
        // VALIDATE THE INPUT
        if (typeof validation(changedName) === "undefined") {
          $(this).replaceWith(oldName); // REPLACE WITH OLD NAME
          return; // STOP THE FUNCTION
        }
        blinkAnimation(row); // ANIMATE THE ROW
        $(this).replaceWith(changedName); // REPLACE THE INPUT WITH THE VALUE OF THE INPUT
        localSave(queue, changedName, status); // UPDATE THE LOCALSTORAGE WITH THE NEW NAME
      } else if (e.key == "Escape") $(this).focusout(); // IF "ESCAPE" IS PRESSED, FOCUSOUT THE INPUT
    });

    // WHEN THE INPUT FOCUSED OUT
    $(".editInput").focusout(function () {
      changedName = capitalize($(this).val()); // GET THE VALUE ON THE INPUT
      // VALIDATE THE INPUT
      if (typeof validation(changedName) === "undefined") {
        $(this).replaceWith(oldName); // REPLACE WITH OLD NAME
        return; // STOP THE FUNCTION
      }
      blinkAnimation(row); // ANIMATE THE ROW
      $(this).replaceWith(changedName); // REPLACE THE INPUT WITH THE VALUE OF THE INPUT
      localSave(queue, changedName, status); // UPDATE THE LOCALSTORAGE WITH THE NEW NAME
    });

    // DELETE BUTTON
  } else {
    // SWEETALERT2 CONFIRM DIALOG
    Swal.fire({
      title: "Are you sure?",
      text: `Delete patient "${oldName}"?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    }).then((result) => {
      // IF CONFIRMED
      if (result.isConfirmed) {
        let queueCol = row.find(".qCol"); // CURRENT QUEUE COLUMN
        let queue = queueCol.text(); // QUEUE NUMBER

        slowDisappear(row); // SLOWLY DISAPPEAR ANIMATION
        for (let i = queue; i < localStorage.length; i++) {
          setTimeout(() => moveDown(row, queueCol, 0), 1000); // MOVE THE ROW TO THE VERY BOTTOM
        }
        setTimeout(() => row.remove(), 1000); // REMOVE THE ROW
        setTimeout(() => localStorage.removeItem(localStorage.length), 1000); // REMOVE FROM THE LOCALSTORAGE
        q--; // DECREASE QUEUE BY 1

        notification("Patient has been deleted", "danger"); // DELETE NOTIFICATION
      }
    });
  }
});

//////////////////////////////////////////// HELPER FUNCTIONS /////////////////////////////////////////////
// ADD ROW FUNCTION
const addRow = (patientName, status) => {
  $("#records").append(`
      <tr class="record">
        <td class="qCol">${q}</td>
        <td class="nameCol">${patientName}${status == "Done" ? '<i class="fa-solid fa-check fa-lg"></i>' : ""}</td>
        <td class="statusCol">
          <button class="waitingButton" ${status == "Waiting" ? "disabled" : ""} name="Waiting">Waiting</button>
          <button class="processButton" ${status == "Process" ? "disabled" : ""} name="Process">Process</button>
          <button class="doneButton" ${status == "Done" ? "disabled" : ""} name="Done">Done</button>
        </td>
        <td class="moveCol">
          <button class="upButton"><i class="fa-solid fa-arrow-up"></i></button>
          <button class="downButton"><i class="fa-solid fa-arrow-down"></i></button>
        </td>
        <td class="actionCol">
          <button class="editButton">Edit</button>
          <button class="deleteButton">Delete</button>
        </td>
      </tr>`);
};

// PATIENT INPUT FUNCTION
const patientInput = () => {
  let patientName = capitalize($("#patientInput").val()); // GET PATIENT NAME FROM INPUT
  let status = "Waiting"; // DECLARE DEFAULT STATUS "WAITING"
  if (typeof validation(patientName) === "undefined") return; // VALIDATE THE INPUT

  addRow(patientName.trim(), status); // ADD NEW ROW
  blinkAnimation($("tr:last")); // NEW ROW ANIMATE
  localSave(q++, $("#patientInput").val(), "Waiting"); // SAVE DATA ON LOCALSTORAGE
  notification("Patient has been added", "success"); // NOTIFICATION MESSAGE
  $("#patientInput").val(""); // EMPTYING THE INPUT
};

// ROW MOVE UP FUNCTION
const moveUp = (row, queueCol, duration = 150) => {
  let prevQueueCol = row.prev().find(".qCol"); // PREVIOUS QUEUE COLUMN
  row.prev().before(row); // INSERT CURRENT ROW TO BEFORE PREVIOUS ROW
  blinkAnimation(row); // ANIMATE WHEN MOVE

  // MAKE CONTAINER VARIABLE FOR CURRENT AND PREVIOUS QUEUE AND SWAP THE VALUE
  let [queue, prevQueue] = [queueCol.text(), prevQueueCol.text()];
  queueCol.text(prevQueue);
  prevQueueCol.text(queue);
  // MAKE CONTAINER VARIABLE FOR CURRENT AND PREVIOUS QUEUE VALUE FROM LOCALSTORAGE AND SWAP THE VALUE
  let [queueValue, prevQueueValue] = [localStorage.getItem(queue), localStorage.getItem(prevQueue)];
  localStorage.setItem(queue, prevQueueValue);
  localStorage.setItem(prevQueue, queueValue);
};

// ROW MOVE DOWN FUNCTION
const moveDown = (row, queueCol, duration = 150) => {
  let nextQueueCol = row.next().find(".qCol"); // NEXT QUEUE COLUMN
  row.next().after(row); // INSERT CURRENT ROW TO AFTER NEXT ROW
  blinkAnimation(row); // ANIMATE WHEN MOVE

  // MAKE CONTAINER VARIABLE FOR CURRENT AND NEXT QUEUE AND SWAP THE VALUE
  let [queue, nextQueue] = [queueCol.text(), nextQueueCol.text()];
  queueCol.text(nextQueue);
  nextQueueCol.text(queue);
  // MAKE CONTAINER VARIABLE FOR CURRENT AND NEXT QUEUE VALUE FROM LOCALSTORAGE AND SWAP THE VALUE
  let [queueValue, nextQueueValue] = [localStorage.getItem(queue), localStorage.getItem(nextQueue)];
  localStorage.setItem(queue, nextQueueValue);
  localStorage.setItem(nextQueue, queueValue);
};

// NOTIFICATION FUNCTION
const notification = (message, type) => {
  if (type == "success") {
    $("#notification").text(message).css({ color: "#31664d", "background-color": "#d1e7dd", border: "5px solid #beddcf" }).animate({ top: "5%" }, 500);
  } else {
    $("#notification").text(message).css({ color: "#842029", "background-color": "#f8d7da", border: "5px solid #f4ccd0" }).animate({ top: "5%" }, 500);
  }
  setTimeout(() => $("#notification").animate({ top: "-10%" }, 500), 2000);
};

// CAPITALIZE FUNCTION
const capitalize = (strings) => {
  return strings
    .split(" ")
    .map((string) => (string ? string[0].toUpperCase() + string.slice(1).toLowerCase() : ""))
    .join(" ");
};

// BLINK ANIMATION
const blinkAnimation = (element) => element.animate({ opacity: "0.3" }, 300).animate({ opacity: "1" }, 300);

// SLOWLY DISAPPEAR ANIMATION
const slowDisappear = (element) => element.animate({ opacity: 0 }, 1000);

// LOCALSTORAGE SAVE
const localSave = (queue, name, status) => localStorage.setItem(queue, [name, status]);

// INPUT VALIDATION FUNCTION
const validation = (input) => {
  input = input.trim();
  if (!input) return notification("Name cannot be empty", "danger"); // IF THE INPUT IS EMPTY
  if (input.includes(",")) return notification("Cannot use comma", "danger"); // IF THE INPUT IS CONTAIN A COMMA
  if (input.search(/[0-9]/) >= 0) return notification("Cannot use number", "danger"); // IF THE INPUT CONTAIN NUMERIC
  return " "; // IF INPUT IS VALID RETURN STRING INSTEAD OF UNDEFINED
};
