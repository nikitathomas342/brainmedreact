import $ from "jquery";
import swal from "sweetalert";

export function ClearCanvas() {
  $(".Calibration").hide();
  var canvas = document.getElementById("plotting_canvas");
  canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
}

export function PopUpInstruction() {
  ClearCanvas();
  swal({
    title: "Calibration",
    text: "Please click on each of the 9 points on the screen. You must click on each point 5 times till it goes yellow. This will calibrate your eye movements.",
    buttons: {
      cancel: false,
      confirm: true,
    },
  }).then(ShowCalibrationPoint);
}

export function helpModalShow() {
  $("#helpModal")?.modal("show");
}

export function ShowCalibrationPoint() {
  $(".Calibration").show();
  $("#Pt5").hide();
}

export const sleep = (time) =>
  new Promise((resolve) => setTimeout(resolve, time));
