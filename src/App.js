import React, { useReducer, useEffect } from "react";
import "./App.css";

const initialState = {
  phase: "normal", // possible phases: normal, disabled1, oneToggle, disabled2, ghostTrigger, ghost, hidden, greyed
  isChecked: false,
  pressCount: 0,
};

function reducer(state, action) {
  switch (action.type) {
    case "TOGGLE":
      // Only respond to toggle events when allowed
      if (state.phase === "normal") {
        // If already checked and the new value is false, it’s a full cycle
        if (state.isChecked && !action.payload) {
          const newPressCount = state.pressCount + 1;
          // After 3 cycles, disable for 5 seconds
          if (newPressCount >= 3) {
            return {
              ...state,
              isChecked: false,
              pressCount: newPressCount,
              phase: "disabled1",
            };
          } else {
            return { ...state, isChecked: false, pressCount: newPressCount };
          }
        } else {
          return { ...state, isChecked: action.payload };
        }
      } else if (state.phase === "oneToggle") {
        if (state.isChecked && !action.payload) {
          // Allow one full cycle then disable for 3 seconds (changed from 10 sec to 3 sec)
          return { ...state, isChecked: false, phase: "disabled2" };
        } else {
          return { ...state, isChecked: action.payload };
        }
      } else if (state.phase === "ghostTrigger") {
        // In ghostTrigger phase, any click triggers the ghost transformation
        return { ...state, phase: "ghost" };
      }
      return state;
    case "TIMER":
      // Handle timer-driven phase transitions
      if (state.phase === "disabled1" && action.timerPhase === "disabled1") {
        return { ...state, phase: "oneToggle", pressCount: 0 };
      } else if (
        state.phase === "disabled2" &&
        action.timerPhase === "disabled2"
      ) {
        return { ...state, phase: "ghostTrigger" };
      } else if (state.phase === "ghost" && action.timerPhase === "ghost") {
        return { ...state, phase: "hidden" };
      } else if (state.phase === "hidden" && action.timerPhase === "hidden") {
        return { ...state, phase: "restart" };
      }
      return state;
    case "RESTART":
      return initialState;
    default:
      return state;
  }
}

function App() {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Event handler for checkbox changes
  const handleChange = (e) => {
    const newValue = e.target.checked;
    dispatch({ type: "TOGGLE", payload: newValue });
  };

  // useEffect for scheduling timers when entering timer-driven phases
  useEffect(() => {
    let timer;
    if (state.phase === "disabled1") {
      timer = setTimeout(() => {
        dispatch({ type: "TIMER", timerPhase: "disabled1" });
      }, 5000);
    } else if (state.phase === "disabled2") {
      timer = setTimeout(() => {
        dispatch({ type: "TIMER", timerPhase: "disabled2" });
      }, 3000); // changed from 10s to 3s
    } else if (state.phase === "ghost") {
      timer = setTimeout(() => {
        dispatch({ type: "TIMER", timerPhase: "ghost" });
      }, 1000);
    } else if (state.phase === "hidden") {
      timer = setTimeout(() => {
        dispatch({ type: "TIMER", timerPhase: "hidden" });
      }, 5000);
    }
    return () => clearTimeout(timer);
  }, [state.phase]);

  // Determine if the checkbox should be disabled
  const inputDisabled =
    state.phase === "disabled1" ||
    state.phase === "disabled2" ||
    state.phase === "greyed";

  const restart = () => {
    dispatch({ type: "RESTART" });
  };

  // Build the className for the checkbox:
  // - "big" makes it 3× larger.
  // - "spin" adds the spin animation when the checkbox is checked.
  // - "greyed" applies styling for the final unresponsive phase.
  let checkboxClass = "big";
  if (
    (state.phase === "normal" ||
      state.phase === "oneToggle" ||
      state.phase === "ghostTrigger" ||
      state.phase === "disabled1" ||
      state.phase === "disabled2") &&
    state.isChecked
  ) {
    checkboxClass += " spin";
  }
  if (state.phase === "greyed") {
    checkboxClass += " greyed";
  }

  return (
    <div className="App">
      {state.phase === "ghost" ? (
        // Render the ghost emoji
        <div className="ghost">👻</div>
      ) : state.phase === "hidden" ? (
        // Render an empty placeholder when hidden
        <div style={{ height: "60px" }}></div>
      ) : state.phase === "restart" ? (
        <div>
          <button onClick={restart}>Restart</button>
        </div>
      ) : (
        // Otherwise, render the checkbox input
        <input
          type="checkbox"
          className={checkboxClass}
          checked={state.isChecked}
          onChange={handleChange}
          disabled={inputDisabled}
        />
      )}
    </div>
  );
}

export default App;
