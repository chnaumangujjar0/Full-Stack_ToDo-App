import { Children, createContext, useContext, useState } from "react";

const themeContext = createContext()

const ThemeProvider = ({ children }) => {
    const [themeMode,setThemeMode] = useState("light")
    return(
        <themeContext.Provider value={{themeMode, setThemeMode}}>
            {children}
        </themeContext.Provider>
    )
}

export const useTheme = () =>{
    return useContext(themeContext)
}

export default ThemeProvider

