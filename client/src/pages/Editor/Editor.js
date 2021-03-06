import React, { Component } from "react";
import { Redirect } from 'react-router-dom';
import withAuthorization from '../../components/AuthUserSession/withAuthorization';
import API from '../../utils/API';
import RichTextEditor from 'react-rte';
import colourStyles from './colourStyles';
// Tag Multiselect
import Select from 'react-select';
import makeAnimated from 'react-select/lib/animated';
import guidelinesImage from '../../assets/images/guidelines.png';
import { Row, Input, TextArea, MainWrapper, Form, Button } from '../../components/Widgets';

// React Select docs: https://react-select.com/home

// FIXME: Any logged in user can open up the editor view by putting /edit after a post url
//          Actually updating it is blocked serverside.

// TODO: Implement a check on componentWillUnmount to determine whether we can discard the draft or not

class CreatePost extends Component {
  constructor(props) {
    super(props);
    this.toggle = this.toggle.bind(this);
    this.dropdownChange = this.dropdownChange.bind(this);

    const initialCategoryName = props.match.params.categoryName || ''

    this.state = {
      tags: [],
      teaser: "",
      title: "",
      categories: [],
      categoryName: initialCategoryName,
      categoryDisplayName: '',
      selectedCategoryName: '',
      selectedTags: [],
      dropdownOpen: false,
      redirectToNewPage: false,
      redirectPathId: "",
      value: RichTextEditor.createEmptyValue(),
      selectedOptions: null,
      postId: null,
      author: props.authUser.dbUser._id,
      paywallCost: '',
    };
  }

  componentDidMount() {
    const isNewPost = !this.props.match.params.postId ? true : false
    const categoryData = this.getCategoryMenuData();
    const postData = isNewPost ? this.initialSave() : this.loadPost()

    Promise.all([categoryData, postData])
      .then(([categoryData, postData]) => {
        let categoryDisplayName = postData.categoryName ? categoryData.find(c => c.value === postData.categoryName).value : ''
        let tags = postData.categoryName ? categoryData.find(c => c.value === postData.categoryName).tags : []
        let selectedOptions = (postData.tags < 1) ? [] : postData.tags.map(t => {
          return { value: t, label: t, color: 'darkcyan' }
        })

        this.setState({
          categories: categoryData,
          selectedTags: postData.tags,
          value: RichTextEditor.createValueFromString(postData.body, 'html'),
          title: postData.title,
          teaser: postData.teaser || '',
          isDraft: postData.isDraft,
          // paywallCost: postData.paywallCost, // <--- TODO: react doesn't like this setting for some reason
          postId: postData._id,
          categoryName: postData.categoryName,
          categoryDisplayName,
          tags,
          selectedOptions,
        })
      })
      .catch(err => console.log('componentDidMount getData Error:', err))
  }

  initialSave = () => {
    const data = {
      title: `Untitled ${new Date().toDateString()}`,
      body: 'And so it begins...',
      isDraft: true
    }
    return API.createPost(data)
      .then(result => result.data)
      .catch(err => console.log(err))
  };

  loadPost() {
    return API.getPost(this.props.match.params.postId)
      .then(result => result.data)
      .catch(err => {
        console.log('Error Loading Post Data:', err)
      })
  }

  getCategoryMenuData = () => {
    return API.getCategoriesTags()
      .then((result) => {
        return result.data.map(category => {
          return {
            value: category.name,
            label: category.displayName,
            tags: category.tags.sort().map(tag => {
              return {
                value: tag,
                label: tag,
                color: "darkcyan"
              }
            })
          }
        })
        // this.setState({ categories: (categoriesFromApi) });
      }).catch(error => {
        console.log('Error getting Category Data', error);
      });
  };

  toggle() {
    this.setState({
      dropdownOpen: !this.state.dropdownOpen
    });
  };

  onEditorChange = (value) => this.setState({ value })

  handleInputChange = (event) => {
    const { name, value } = event.target;
    this.setState({ [name]: value });
  };

  dropdownChange(event) {
    console.log('dropdownChange event', event)
    this.setState({
      dropdownOpen: !this.state.dropdownOpen,
      categoryName: event.value,
      categoryDisplayName: this.state.categories.find(c => c.value === event.value).label,
      tags: event.tags,
      selectedOptions: null,
      selectedTags: null,
    })
  };

  handleTagChange = (selectedOptions) => {
    this.setState({
      selectedOptions,
      selectedTags: selectedOptions.map(tag => tag.value)
    });
  };

  handleFormSubmit = (event) => {
    event.preventDefault();

    const { title, value, teaser, paywallCost } = this.state
    const body = value.toString('html')
    if (title && body) {
      const data = {
        title: title,
        teaser: teaser,
        body: body,
        paywallCost: paywallCost,
        categoryName: this.state.categoryName,
        isDraft: false,
        tags: this.state.selectedTags || [],
      };

      API.updatePost(this.state.postId, data)
        .then(result => {
          // this.setState({ redirectToNewPage: true, redirectPathId: result.data._id })
          this.props.history.push(`/posts/${result.data._id}`)
        }).catch(err => console.log(err))
    };
  };
  //Saving a draft
  saveDraft = (event) => {
    event.preventDefault();
    const { title, selectedTags, teaser, value } = this.state
    const body = value.toString('html')

    const data = {
      title: title,
      teaser: teaser,
      body: body,
      tags: selectedTags,
      categoryName: this.state.categoryName,
      isDraft: true,
    };
    API.submitDraft(this.state.postId, data)
      .then(res => console.log('save draft response', res))
      .catch(err => console.log(err))
  };

  render() {
    const { selectedOptions } = this.state;

    if (this.state.redirectToNewPage) {
      return (
        <Redirect to={{ pathname: '/posts/' + this.state.redirectPathId }} />
      );
    };

    return (
      <React.Fragment>
        <div className='absolute w-full'>
          <Row styles={"mt-12"}>
            <div className="col-md-1"></div>
            <div className="col-md-8" >
            <MainWrapper styles={'px-3 pt-4'}>
              <Form onSubmit={this.handleFormSubmit}>
                <div className="form-group">
                {this.props.match.params.postId
                  ? <h2 className='mb-4'>EDIT POST</h2>
                  : <h2 className='mb-4'>CREATE POST</h2>
                }
                {/* Will need to find the other z-index's before I change this ctaegorySelect z-index */}
                  <Select className="categorySelect"
                    onChange={this.dropdownChange}
                    options={this.state.categories}
                    theme={(theme) => ({ ...theme, borderRadius: 5, })}
                    value={{
                      value: this.state.categoryName,
                      label: this.state.categoryDisplayName,
                      color: 'darkcyan'
                    }}
                    isDisabled={!this.state.isDraft}
                  />

                </div>
                <div className='form-group'>
                  <input
                    className='form-control'
                    type='text'
                    onChange={this.handleInputChange}
                    value={this.state.title}
                    placeholder='Title'
                    name='title'
                    disabled={!this.state.isDraft}
                  />
                </div>
                <Input
                  className='form-control'
                  id= 'paywallField'
                  onChange={this.handleInputChange}
                  type='number'
                  step='0.01'
                  min='0.00'
                  style={{ width: 200 + 'px' }}
                  placeholder='Paywall Cost (x.xx)'
                  value={this.state.paywallCost}
                  name='paywallCost'
                />
                <TextArea
                  placeholder='Teaser'
                  onChange={this.handleInputChange}
                  name='teaser'
                  value={this.state.teaser}
                />
                <p>Information in the teaser section is available to all Listoka visitors.  Use this field to interest readers in your content.</p>
                <RichTextEditor
                  value={this.state.value}
                  onChange={this.onEditorChange}
                />
                <br/>
                <Select
                  id="tagField"
                  className='react-select-container'
                  classNamePrefix="rounded"
                  value={selectedOptions}
                  onChange={this.handleTagChange}
                  options={this.state.tags}
                  isMulti
                  isClearable={true}
                  placeholder="Tags"
                  closeMenuOnSelect={false}
                  components={makeAnimated()}
                  styles={colourStyles}
                  theme={(theme) => ({
                    ...theme,
                    borderRadius: 5,
                  })}
                />
                <br/>
                <Button
                  type='submit'
                  text='Submit'
                />
                {
                  this.state.isDraft
                    ? <Button  onClick={this.saveDraft} text='Save Draft'></Button>
                    : null
                }
              </Form>
            </MainWrapper>
            </div>
            <div className="col-md-3">
              <MainWrapper styles={'min-width150px'}>
                <div className='text-center'>
                  <img className="img-fluid text-center" src={guidelinesImage} alt="Listoka Guidelines"></img>
                </div>
                <h2 className='mt-3 text-center font-bold'>Posting Guidelines</h2>
                <hr/>
                <ul>
                  <li>Guideline 1</li>
                  <li>Guideline 2</li>
                  <li>Guideline 3</li>
                  <li>Guideline 4</li>
                  <li>Guideline 5</li>
                </ul>
              </MainWrapper>
            </div>
          </Row>
      </div>
    </React.Fragment>
    );
  };
};

const authCondition = (authUser) => !!authUser

export default withAuthorization(authCondition)(CreatePost);