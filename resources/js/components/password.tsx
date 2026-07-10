import password from "@images/password.svg";
import { useState, forwardRef } from "react";

const Password = forwardRef(({ passwordConfirm = false, value, onChange }, ref) => {

    const [showPassword, setShowPassword] = useState(false);

    return (
    
        <>
            <input
                type={showPassword ? "text" : "password"} 
                required 
                pattern=".{8,}" 
                value={value} 
                ref={ref} 
                onChange={onChange}
                title="O campo deve ter no mínimo 8 caracteres." 
                class="form-control" />

            <button
                type="button"
                class="show-password"
                name="password"
                onClick={(e) => {
                    setShowPassword(!showPassword);
                    e.currentTarget.classList.toggle('active');
                }
            }>

                <img
                    src={password}
                    alt="Mostrar" />

            </button>
        </>
    );
});

Password.displayName = 'Password';
export default Password;
