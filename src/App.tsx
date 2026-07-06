import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../amplify/data/resource";
import { Amplify } from "aws-amplify";
import outputs from "../amplify_outputs.json";
import "@aws-amplify/ui-react/styles.css";

Amplify.configure(outputs);

const client = generateClient<Schema>();

export default function App() {
  const [ingredients, setIngredients] = useState<string>("");
  const [recipe, setRecipe] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await client.queries.askBedrock({
        ingredients: [ingredients],
      });
      const res = JSON.parse(response.data?.body || "{}");
      setRecipe(res.recipe || "No recipe found");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="app-container">
      <div className="header-container">
        <h1 className="main-header">
          Meet Your Personal <span className="highlight">Recipe AI</span>
        </h1>
        <p className="description">
          Type the ingredients you have on hand, and let AI generate a custom recipe for you!
        </p>
      </div>

      <form onSubmit={onSubmit} className="form-container">
        <div className="search-container">
          <input
            type="text"
            className="wide-input"
            id="ingredients"
            name="ingredients"
            placeholder="Ingredient 1, Ingredient 2, Ingredient 3"
            onChange={(e) => setIngredients(e.target.value)}
          />
          <button type="submit" className="search-button">
            {loading ? "Generating..." : "Generate Recipe"}
          </button>
        </div>
      </form>

      <div className="result-container">
        {loading && (
          <div className="loader-container">
            <p>Thinking up something delicious...</p>
          </div>
        )}
        {recipe && !loading && (
          <div className="result">
            <p>{recipe}</p>
          </div>
        )}
      </div>
    </main>
  );
}
