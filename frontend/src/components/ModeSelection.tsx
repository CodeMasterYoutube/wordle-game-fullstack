import React from "react";

interface ModeSelectionProps {
  onSelectSinglePlayer: () => void;
  onSelectMultiplayer: () => void;
}

const ModeSelection: React.FC<ModeSelectionProps> = ({
  onSelectSinglePlayer,
  onSelectMultiplayer,
}) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        backgroundColor: "#ffffff",
        padding: "20px",
      }}
    >
      <h1
        style={{
          fontSize: "48px",
          fontWeight: "bold",
          marginBottom: "20px",
          textAlign: "center",
        }}
      >
        WORDLE
      </h1>

      <p
        style={{
          fontSize: "18px",
          color: "#787c7e",
          marginBottom: "50px",
          textAlign: "center",
        }}
      >
        Choose your game mode
      </p>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          width: "100%",
          maxWidth: "400px",
        }}
      >
        <button
          onClick={onSelectSinglePlayer}
          style={{
            padding: "20px 40px",
            fontSize: "20px",
            fontWeight: "bold",
            backgroundColor: "#6aaa64",
            color: "#ffffff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            transition: "background-color 0.2s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "#5a9a54")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "#6aaa64")
          }
        >
          Single Player
        </button>

        <button
          onClick={onSelectMultiplayer}
          style={{
            padding: "20px 40px",
            fontSize: "20px",
            fontWeight: "bold",
            backgroundColor: "#c9b458",
            color: "#ffffff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            transition: "background-color 0.2s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "#b9a448")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "#c9b458")
          }
        >
          Multiplayer (2 Players)
        </button>
      </div>

      <div
        style={{
          marginTop: "60px",
          fontSize: "14px",
          color: "#787c7e",
          textAlign: "center",
          maxWidth: "500px",
        }}
      >
        <p style={{ marginBottom: "10px" }}>
          <strong>Single Player:</strong> Play the classic Wordle game
        </p>
        <p>
          <strong>Multiplayer:</strong> Compete with a friend to guess the same
          word. Score points for correct letters!
        </p>
      </div>
      <div
        style={{
          marginTop: "60px",
          fontSize: "14px",
          color: "#787c7e",
          textAlign: "center",
          maxWidth: "500px",
        }}
      >
        <p>
          <strong>Created by:</strong> Bruce Bakshi
        </p>
        <p>
          <strong>My YouTube Channel:</strong>{" "}
          <a
            href="https://www.youtube.com/@CodeMasterOfficial"
            target="_blank"
            rel="noopener noreferrer"
          >
            https://www.youtube.com/@CodeMasterOfficial
          </a>
        </p>
        <p>
          <strong>My GitHub Repo:</strong>{" "}
          <a
            href="https://github.com/CodeMasterYoutube/wordle-game-fullstack"
            target="_blank"
            rel="noopener noreferrer"
          >
            https://github.com/CodeMasterYoutube/wordle-game-fullstack
          </a>
        </p>
      </div>
    </div>
  );
};

export default ModeSelection;
