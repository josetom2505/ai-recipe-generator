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
  const [error, setError] = useState<string>("");

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setRecipe("");
    try {
      const list = ingredients
        .split(",")
        .map((i) => i.trim())
        .filter(Boolean);
      if (list.length === 0) {
        setError("Please enter at least one ingredient.");
        return;
      }
      const response = await client.queries.askBedrock(
        { ingredients: list },
        { authMode: "userPool" }
      );
      if (response.errors?.length) {
        throw new Error(response.errors[0].message);
      }
      setRecipe(response.data?.body || "No recipe found");
    } catch (err) {
      console.error(err);
      setError("Something went wrong generating your recipe. Please try again.");
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
            value={ingredients}
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
        {error && !loading && <p className="error">{error}</p>}
        {recipe && !loading && (
          <div className="result">
            <p style={{ whiteSpace: "pre-wrap" }}>{recipe}</p>
          </div>
        )}
      </div>
    </main>
  );
}
