/* eslint-disable jsx-a11y/anchor-is-valid */
import "./style.css";
import "./video.css";
// @ts-ignore
import { webgazer } from "./webgazer";
import {
  ClearCanvas,
  helpModalShow,
  PopUpInstruction,
  ShowCalibrationPoint,
  sleep,
} from "./utils/calibration";
import {
  store_points_variable,
  stop_storing_points_variable,
} from "./utils/precisionStorePoints";
import { calculatePrecision } from "./utils/precisionCalculationa";
import React from "react";
import $ from "jquery";
import swal from "sweetalert";

export const App = () => {
  window.onload = async () => {
    await webgazer
      .setRegression("ridge") /* currently must set regression and tracker */
      //.setTracker('clmtrackr')
      .setGazeListener(function () {})
      .saveDataAcrossSessions(true)
      .begin();
    webgazer
      .showVideoPreview(true) /* shows all video previews */
      .showPredictionPoints(
        true
      ) /* shows a square every 100 milliseconds where current prediction is */
      .applyKalmanFilter(
        true
      ); /* Kalman Filter defaults to on. Can be toggled by user. */
    (() => {
      var canvas = document.getElementById(
        "plotting_canvas"
      ) as HTMLCanvasElement;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      canvas.style.position = "fixed";
    })();
  };

  // @ts-ignore
  window.saveDataAcrossSessions = true;

  window.onbeforeunload = function () {
    webgazer.end();
  };

  function restart() {
    const accuracy = document.getElementById("Accuracy") as HTMLElement;
    accuracy.innerHTML = "<a>Not yet Calibrated</a>";
    webgazer.clearData();
    ClearCalibration();
    PopUpInstruction();
  }

  function resize() {
    var canvas = document.getElementById(
      "plotting_canvas"
    ) as HTMLCanvasElement;
    var context = canvas.getContext("2d") as CanvasRenderingContext2D;
    context.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  window.addEventListener("resize", resize, false);

  var PointCalibrate = 0;
  var CalibrationPoints = {};

  function ClearCalibration() {
    $(".Calibration").css("background-color", "red");
    $(".Calibration").css("opacity", 0.2);
    $(".Calibration").prop("disabled", false);

    CalibrationPoints = {};
    PointCalibrate = 0;
  }

  $(document).ready(function () {
    ClearCanvas();
    helpModalShow();
    $(".Calibration").click(function () {
      // click event on the calibration buttons

      var id = $(this).attr("id");

      if (!CalibrationPoints[id]) CalibrationPoints[id] = 0;
      CalibrationPoints[id]++; // increments values
      if (CalibrationPoints[id] === 5) {
        $(this).css("background-color", "yellow");
        $(this).prop("disabled", true); //disables the button
        PointCalibrate++;
      } else if (CalibrationPoints[id] < 5) {
        var opacity = 0.2 * CalibrationPoints[id] + 0.2;
        $(this).css("opacity", opacity);
      }

      if (PointCalibrate === 8) {
        $("#Pt5").show();
      }

      if (PointCalibrate >= 9) {
        // last point is calibrated
        //using jquery to grab every element in Calibration class and hide them except the middle point.
        $(".Calibration").hide();
        $("#Pt5").show();

        // clears the canvas
        var canvas = document.getElementById(
          "plotting_canvas"
        ) as HTMLCanvasElement;
        canvas.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);

        // notification for the measurement process
        swal({
          title: "Calculating measurement",
          text: "Please don't move your mouse & stare at the middle dot for the next 5 seconds. This will allow us to calculate the accuracy of our predictions.",
          closeOnEsc: false,
          // @ts-ignore
          allowOutsideClick: false,
          closeModal: true,
        }).then(() => {
          // makes the variables true for 5 seconds & plots the points
          $(document).ready(function () {
            store_points_variable(); // start storing the prediction points

            sleep(5000).then(() => {
              stop_storing_points_variable(); // stop storing the prediction points
              var past50 = webgazer.getStoredPoints(); // retrieve the stored points
              var precision_measurement = calculatePrecision(past50);
              var accuracyLabel =
                "<a>Accuracy | " + precision_measurement + "%</a>";
              const accuracy = document.getElementById(
                "Accuracy"
              ) as HTMLElement;
              accuracy.innerHTML = accuracyLabel; // Show the accuracy in the nav bar.
              swal({
                title:
                  "Your accuracy measure is " + precision_measurement + "%",
                allowOutsideClick: false,
                // @ts-ignore
                buttons: {
                  cancel: "Recalibrate",
                  confirm: true,
                },
              }).then((isConfirm) => {
                if (isConfirm) ClearCanvas();
                else {
                  // @ts-ignore
                  document.getElementById("Accuracy").innerHTML =
                    "<a>Not yet Calibrated</a>";
                  webgazer.clearData();
                  ClearCalibration();
                  ClearCanvas();
                  ShowCalibrationPoint();
                }
              });
            });
          });
        });
      }
    });
  });

  return (
    <div className="">
      <canvas
        id="plotting_canvas"
        width="500"
        height="500"
        style={{ cursor: "crosshair" }}
      ></canvas>

      <nav
        id="webgazerNavbar"
        className="navbar navbar-default navbar-fixed-top"
        style={{ backgroundColor: "rgb(255,180,93)" }}
      >
        <div className="container-fluid">
          <div className="navbar-header">
            <button
              type="button"
              className="navbar-toggle"
              data-toggle="collapse"
              data-target="#myNavbar"
              aria-expanded="true"
            >
              <span className="icon-bar">Menu</span>
            </button>
          </div>
          <div className="navbar-collapse collapse show" id="myNavbar">
            <ul className="nav navbar-nav">
              <li id="Accuracy">
                <a>Not yet Calibrated</a>
              </li>
              <li>
                <a onClick={restart} href="#">
                  Recalibrate
                </a>
              </li>
            </ul>
            <ul className="nav navbar-nav navbar-right">
              <li>
                <button
                  className="helpBtn"
                  data-toggle="modal"
                  data-target="#helpModal"
                >
                  <a data-toggle="modal">
                    <span className="glyphicon glyphicon-cog"></span> Help
                  </a>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <div className="calibrationDiv">
        <input type="button" className="Calibration" id="Pt1"></input>
        <input type="button" className="Calibration" id="Pt2"></input>
        <input type="button" className="Calibration" id="Pt3"></input>
        <input type="button" className="Calibration" id="Pt4"></input>
        <input type="button" className="Calibration" id="Pt5"></input>
        <input type="button" className="Calibration" id="Pt6"></input>
        <input type="button" className="Calibration" id="Pt7"></input>
        <input type="button" className="Calibration" id="Pt8"></input>
        <input type="button" className="Calibration" id="Pt9"></input>
      </div>

      <div id="helpModal" className="modal fade" role="dialog">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-body">
              <img
                src="media/example/calibration.png"
                width="100%"
                height="100%"
                alt="webgazer demo instructions"
              ></img>
            </div>
            <div className="modal-footer">
              <button
                id="closeBtn"
                type="button"
                className="btn btn-default"
                data-dismiss="modal"
              >
                Close & load saved model{" "}
              </button>
              <button
                type="button"
                id="start_calibration"
                className="btn btn-primary"
                data-dismiss="modal"
                onClick={restart}
              >
                Calibrate
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
