import React from 'react'
import { List } from '../List'
import CommentNodeContainer from './CommentNodeContainer'

const CommentList = props => {
  const comments = props.comments.sort(compareVotersDesc)
  let classes = 'bg-white border-l border-grey ml-3'

  // this component is used in 2 different, but very similar ways.
  // if it is the 'root' or base container, we want a different set 
  // of styles than if it is an 'embedded' instance of the list
  if (props.root) {
    classes = 'w-4/5 bg-white p1 rounded mx-auto mt-3'
  }

  return (
    <div className={classes}>
      {props.root && <CommentNodeContainer submitComment={props.submitComment} />}
      <List
        data={comments}
        keyProp='_id'
        component={CommentNodeContainer}
        className='none'
        submitComment={props.submitComment}
      />
    </div>
  )
}

// desc order by num voters
function compareVotersDesc(node1, node2) {
  return node2.voters.length - node1.voters.length
}

export default CommentList