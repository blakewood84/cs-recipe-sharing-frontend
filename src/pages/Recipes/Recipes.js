import React from 'react';
import  './style.css';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Card } from 'react-bootstrap';
import AuthService from '../../services/auth.service';
import anime from 'animejs';

const LoadingSpinner = () => {
    return (
        <div className="sk-chase">
            <div className="sk-chase-dot"></div>
            <div className="sk-chase-dot"></div>
            <div className="sk-chase-dot"></div>
            <div className="sk-chase-dot"></div>
            <div className="sk-chase-dot"></div>
            <div className="sk-chase-dot"></div>
        </div>
    )
}

const SearchBarComponent = ({handleSearch}) => {
    return(
        <div className="search-bar">
            <span className="search-text">Find a Recipe:</span> &nbsp;<input className="form-control search" onChange={handleSearch} type="text" style={{fontSize: "14px"}} />
            <i className="fas fa-search search-icon"></i>
        </div>
    )
}

const RecipesSharedTitle = ({numberOfRecipes}) => {
    return(
        <span className="recipe-number">Over {numberOfRecipes} Recipes Shared!</span>
    )
}

const Recipe = ({recipe, savedRecipes, currentUser}) => {
    return(
        
            <Card className="mx-2 my-4 card-hover" style={{ width: "18rem", padding: "0px" }}>
                <Link to={{
                        pathname: `/recipe/${recipe.id}`,
                        state: {recipe}
                }}><Card.Img variant="top" src={recipe.image} height="160px" /></Link>
                <Card.Body>
                <Link to={{
                        pathname: `/recipe/${recipe.id}`,
                        state: {recipe}
                }}><Card.Title style={{textAlign:"center"}}>{recipe.title}</Card.Title>
                    <Card.Text className="">
                        <span className="cook-time">Cook Time: {recipe.cookTime}min</span>
                        <span className="serving-size">Serving Size: {recipe.servingSize}</span>
                    </Card.Text></Link>
                {currentUser && (<div className={`save-recipe`}>
                    <button className="saveHearts" onClick={() => saveRecipe(recipe.id)}><i id={`js-save-${recipe.id}`} className={`far fa-heart`}></i></button>
                </div>
                )}
                </Card.Body> 
            </Card>
    )
}

const ViewRecipeCardsComponent = ({recipes, savedRecipes, currentUser}) => {
    if(recipes.length === 0){
        return(
            <h1 className="no-matches">No Matches</h1>
        )
    }
    else{
        return(
            recipes.map((recipe, index) => {
                return ( 
                        <Recipe key={index} currentUser={currentUser} savedRecipes={savedRecipes} recipe={recipe} />
                )
            }) 
        )
    }
}

const saveRecipe = (recipeId) => {
    if(AuthService.getCurrentUser()){
    const currentUser = AuthService.getCurrentUser();
    const URL = "http://localhost:8080/api/user/my-recipe";
    const headers = {
        Authorization: currentUser.authorization,
        userId: currentUser.id,
        recipeId: recipeId
    }
    
    axios({
        url: URL,
        method: "PUT",
        headers:headers
    }).then(response => {
        if(response.status === 200){
           console.log("Saved Recipe!")
           let heart = document.getElementById(`js-save-${recipeId}`);
           if(heart) {
            heart.classList.toggle('far');  
            heart.classList.toggle('fas');
               if(heart.classList.contains("far")) {
                heart.style.color = "#000000";
               }
               else {
                heart.style.color = "#f52626";
               }          
               AuthService.saveDetails();
             }
        }
        else {
            console.log("Recipe could not be saved - error!")
        }
    })
    }
    else {
        console.log("You must be logged in to save a recipe!");
    }
};

class RecipeHomePageView extends React.Component {
    constructor(props){
        super();
        this.state = {
            recipes: [],
            filtered_recipes: [],
            search_filter: "",
            isLoading: true,
            currentUser: null,
            savedRecipes: null,
        }
    }
    async componentDidMount(){
        let url = "http://localhost:8080/api/recipe/";
        const response = await axios ({
            url: url,
            method: "GET"
        })

        // See if the user is logged in
        const currentUser = AuthService.getCurrentUser();
        // If a user is logged in get the saved Recipes
        if(currentUser){
            const savedRecipes = await AuthService.getSavedRecipes();
            this.setState({
                savedRecipes: savedRecipes
            })
        }
        this.setState({
            recipes: response.data,
            filtered_recipes: response.data,
            isLoading: false,
            currentUser: currentUser,
        })
        this.animateText();
    }

    componentDidUpdate() {
        let savedRecipesArray = this.state.savedRecipes;

        if(this.state.isLoading === false && savedRecipesArray !== null){
            savedRecipesArray.forEach(recipeID => {
                let heart = document.getElementById(`js-save-${recipeID}`);
                if(heart !== null){
                    heart.classList.remove('far');
                    heart.classList.add('fas');
                    heart.style.color = "#f52626";
                }
                
            })
        }
    }
    /**
     * This method animates the "Welcome to CodeChefs" text in the Hero
     */
    animateText(){
        anime.timeline({loop: false})
            .add({
                targets: '.ml15 .word',
                scale: [14,1],
                opacity: [0,1],
                easing: "easeOutCirc",
                duration: 800,
                delay: (el, i) => 800 * i
        });
    }

    handleSearch(e){
        let searchInput = e.target.value;
        searchInput = searchInput.toLowerCase();
        let recipes_data = this.state.recipes;
        let newRecipes = [];
        if(searchInput === ""){
            this.setState({
                filtered_recipes: this.state.recipes
            })
        }
        else if(searchInput !== ""){
            newRecipes = recipes_data.filter(recipe => {
                let recipe_title = recipe.title.toLowerCase();
                if(recipe_title.includes(`${searchInput}`)){
                    return recipe;
                }
                else {
                    return false;
                }
            })
            this.setState({
                filtered_recipes: newRecipes
            })
        }
    }

    render(){
        let howManyRecipes = this.state.recipes.length;
        return(
            
            <div className="container-fluid main-body">
                <div className="jumbotron">
               
                    <h1 className="display-4 ml15"><span className="word">Welcome to</span> <span className="word">CodeChefs</span> <RecipesSharedTitle numberOfRecipes={howManyRecipes} /></h1>
                    <p className="lead">We built this application so that you could be inspired to share and create new recipes for awesome dishes!</p>
                    <hr className="my-4" />
                    <p>Don't forget to check out who we are, the Code Chefs behind the vision!</p>
                    <p className="lead">
                        <a className="btn btn-primary btn-lg" href="/about" role="button">About CodeChefs</a>
                    </p>
                </div>
                    {
                        this.state.isLoading === true ? (<div className="is-loading-container"><LoadingSpinner /></div>) :  
                        
                        (
                            <div className="flex-center">
      <SearchBarComponent handleSearch={this.handleSearch.bind(this)} />
                                <div className="recipes-container">
                                    <ViewRecipeCardsComponent currentUser={this.state.currentUser} savedRecipes={this.state.savedRecipes} recipes={this.state.filtered_recipes} />
                                </div>
                            </div>
                        )
                    
                    }
            </div>
        )
    }
}
    
export default RecipeHomePageView;