import React from "react";
import { Link } from 'react-router-dom';

const CreatePostButton = props => {
    //For the props, we may need to pass in some user information so we can take that in when user makes a post
    //But we may not need to do that here. We might be able to do that when actual submission is made.
    //We may just need the specific category to be propped here
    return (
        <button className="btn btn-success"><Link to='/createpost'>Create Post</Link></button>
    );
};

export default CreatePostButton;