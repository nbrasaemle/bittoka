import React from "react";

//This is the container that holds the mapped-out comments
export const CommentList = (props) => {
    return (
        <div className='clearFix'>
            {props.children}
        </div>
    );
};