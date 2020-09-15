import React, { Component } from 'react'
import './App.css';
import Books from '../Books/Books'
import Nav from '../Nav/Nav'
import Search from '../Search/Search'
import BookInfo from '../BookInfo/BookInfo'
import ReadingList from '../ReadingList/ReadingList'
import './App.css'
import { fetchBooks } from '../../API';
import { connect } from 'react-redux'
import { setBooks, setList } from '../../actions';
import { bindActionCreators } from 'redux';
import { Route, Switch, Link } from 'react-router-dom';

class App extends Component {
  constructor() {
    super();
    this.state = {
      foundBooks: [],
      lists: {
        'celebrities': true,
        'food-and-fitness': true,
        'hardcover-fiction': true,
        'games-and-activities': true,
        'health': true,
      }
    }
  }

  componentDidMount() {
    const { setBooks, setList } = this.props
    const allListUrls = Object.keys(this.state.lists)
    try {
      allListUrls.map(async url => {
        const response = await fetchBooks(url);
        setBooks(response.results.books);
        const books = response.results.books;
        console.log('books after setBooks', books)
        return setList(url, books.map(book => book.primary_isbn10));
      })
    }
    catch ({ message }) {
      alert(message)
    }
  }

  filterBooks = (listName) => {
    const listOfIds = this.props.lists[listName]
    const filteredBooks = this.props.books.filter(book => listOfIds.includes(book.primary_isbn10))
    console.log('filtered books from filterBooks', filteredBooks)
    return filteredBooks;
  }

  createBookLists = () => {
    const listUrls = this.props.lists;
    const listsKeys = Object.keys(listUrls);
    const listBooks = listsKeys.map(listName => {
      const filteredBooks = this.filterBooks(listName)
      console.log('filtered books from createBookLists', filteredBooks)
      if(filteredBooks.length > 0) {
        return (
          <Books key={listName} id={listName} listName={listName} filteredBooks={filteredBooks}/>
        )
      }
    })
    return listBooks
  }

  searchBooks = (search) => {
    const titleSearch = search.toUpperCase()
    const authorSearch = search.charAt(0).toUpperCase() + search.slice(1).toLowerCase() 
    let findBooks = this.props.books.filter(book => {
      if (book.title.includes(titleSearch) || book.author.includes(authorSearch)) {
        console.log('found book', book)
        this.setState({ foundBooks: [book] })
        console.log('state book', this.foundBooks)
      }
    })
    console.log(this.state.foundBooks)
    return findBooks;
  }

  render() {
    const { readingList, books } = this.props
    return (
      <div className="App">
          <Nav />
          <Switch>
            <Route exact path={'/'} render={() => {
              return (<>
                <h1 className='browse-books'>Browse books</h1>
                <Search searchBooks={this.searchBooks}/>
                <section className="found-book-cards" alt="found-book-cards">
                  { this.state.foundBooks ? 
                    this.state.foundBooks.map(foundBook => {
                      return (
                        <>
                          <h1 className='found-book'>{foundBook.title}</h1>
                          <h3 className='found-book author'>{foundBook.author}</h3>
                          <Link to={`/${foundBook.primary_isbn10}`}>
                            <img className="card-image" alt={foundBook.title} src={foundBook.book_image} />
                          </Link>
                        </>
                      )
                    }) : 
                    <h1 className='search-prompt'>Search For Book by Title or Author</h1>
                  }
                </section>
                {this.createBookLists()}
              </>)
            }}
            />
            <Route exact path='/favorites' render={() =>  
              <ReadingList readingList={readingList} /> 
            } />
            <Route exact path='/:bookId' render={({ match }) => {
              const bookClicked = books.find((book) => book.primary_isbn10 == parseInt(match.params.bookId))
              return <BookInfo book={bookClicked} /> }}
            />
          </Switch>
      </div>
    );
  }
}

export const mapStateToProps = ({ books, readingList, lists }) => ({
  books,
  readingList,
  lists
})

export const mapDispatchToProps = dispatch => (
  bindActionCreators({
    setBooks,
    setList
  }, dispatch)
)

export default connect(mapStateToProps, mapDispatchToProps)(App);
 