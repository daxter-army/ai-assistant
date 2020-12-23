from flask import Flask, render_template, request, send_file
import pyautogui

app = Flask(__name__)

# main homepage
@app.route('/', methods = ["POST"])
def index():
    if request.method == "POST":
        try:
            print("route: '/' accessed")

            # getting variabled from the request
            incoming = request.get_json()
            phrase = incoming['phrase']
            times = incoming['presses']

            print("phrase : %s" % phrase)
            print("presses : %s" % times)

            command = ""

            # pressing the hotkeys
            if phrase == "plus":
                # ctrl + + wasn't working, idk
                for i in range(0, times):
                    pyautogui.hotkey('ctrl', '=')
                command = "zoomIn"

                # easiest solution
            elif phrase == "minus" or phrase == "-":
                for i in range(0, times):
                    pyautogui.hotkey('ctrl', '-')
                command = "zoomOut"

            elif phrase == "save":
                for i in range(0, times):
                    pyautogui.hotkey('ctrl', 's')
                command = "save"

            elif phrase == "select":
                for i in range(0, times):
                    pyautogui.press('v')
                command = "select"

            elif phrase == "tab":
                for i in range(0, times):
                    pyautogui.press("tab")
                command = "enlarge workspace"
            
            elif phrase == "pic":
                for i in range(0, times):
                    pyautogui.press("i")
                command = "color picker"
            # To add more functions 

            print(command)

            # response to the server
            return {
                "command" : command,
                "status" : 200,
                "response" : "ok"
            }

        except:
            return {
                "command" : "something unexpected happened...try again !!!",
                "status" : 501,
                "response" : "not implemented"
            }

@app.route('/assist')
def gui():
    return render_template("index.html")

@app.route('/favicon.ico')
def favicon():
    return send_file('./static/favicon/favicon-32x32.png')

if __name__ == '__main__':
    app.debug = True
    app.run()