
import React, { useEffect, useState } from "react";

// User has switched back to the tab
const onFocus = () => {
    console.log("Tab is in focus");
};

// User has switched away from the tab (AKA tab is hidden)
const onBlur = () => {
    console.log("Tab is blurred");
};

const WindowFocusHandler = () => {

    const [visible,setVisible] = useState<string>();

    useEffect(() => {
        setVisible(document.visibilityState);
        console.log(document.visibilityState);
  }, [document.visibilityState]);

    return (
        <div> 
            {visible}
        </div>
    );
};

export default WindowFocusHandler;