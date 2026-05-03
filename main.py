import sys
import os

def run_preprocess():
    print("Running preprocessing...")
    os.system("python src/preprocess.py")

def run_sequence():
    print("Generating sequences...")
    os.system("python src/sequence.py")

def run_train():
    print("Training model...")
    os.system("python src/train.py")

def run_evaluate():
    print("Evaluating model...")
    os.system("python src/evaluate.py")

def run_predict():
    print("Running prediction...")
    os.system("python src/predict.py")

def run_api():
    print("Starting backend API...")
    os.system("python api/app.py")

# ---------------------------
# MAIN CONTROL
# ---------------------------
if __name__ == "__main__":

    if len(sys.argv) < 2:
        print("\nUsage:")
        print("python main.py preprocess")
        print("python main.py sequence")
        print("python main.py train")
        print("python main.py evaluate")
        print("python main.py predict")
        print("python main.py api\n")
        sys.exit()

    command = sys.argv[1]

    if command == "preprocess":
        run_preprocess()

    elif command == "sequence":
        run_sequence()

    elif command == "train":
        run_train()

    elif command == "evaluate":
        run_evaluate()

    elif command == "predict":
        run_predict()

    elif command == "api":
        run_api()

    else:
        print("Invalid command!")