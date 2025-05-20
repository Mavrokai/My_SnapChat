import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  login: {
    backgroundColor: "white",
    padding: 25,
    borderBottomColor: "black",
    borderBottomWidth: 1,
  },
  register: {
    backgroundColor: "#FD3E83",
    padding: 25,
  },
  buttonText: {
    textAlign: "center",
    fontSize: 20,
  },
  buttonContainer: {
    flexDirection: "column",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 0,
  },
});

export default styles;
