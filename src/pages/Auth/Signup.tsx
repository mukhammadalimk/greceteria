import { FormEvent, useContext, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import TextInput from "../../components/UI/Inputs/TextInput";
import PasswordInput from "../../components/UI/Inputs/PasswordInput";
import { AuthContext } from "../../store/AuthContext";
import { signup } from "../../api/auth";

const Signup = () => {
  const [agreement, setAgreement] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const nameRef = useRef<HTMLInputElement>(null);
  const usernameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const passwordConfirmRef = useRef<HTMLInputElement>(null);

  const {
    state: { loading },
    dispatch,
  } = useContext(AuthContext);

  const onSignupHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const name = nameRef.current?.value;
    const username = usernameRef.current?.value;
    const email = emailRef.current?.value;
    const password = passwordRef.current?.value;
    const passwordConfirm = passwordConfirmRef.current?.value;

    const userData = {
      name,
      username,
      email,
      password,
      passwordConfirm,
      agreement,
    };
    await signup(dispatch, userData, location, navigate);
  };

  return (
    <div className="section-xl">
      <div className="container">
        <div className="form-wrapper">
          <h6>Create Account</h6>
          <form className="form" onSubmit={onSignupHandler}>
            <TextInput
              label="Your name*"
              placeholder="Laura Wilson"
              type="text"
              ref={nameRef}
            />
            <TextInput
              label="Your username*"
              placeholder="laurawilson"
              type="text"
              ref={usernameRef}
            />
            <TextInput
              label="Your email*"
              placeholder="laurawilson@example.com"
              type="email"
              ref={emailRef}
            />
            <PasswordInput label="Password*" ref={passwordRef} />
            <PasswordInput label="Confirm Password*" ref={passwordConfirmRef} />
            <div className="form__content">
              <div className="form-check radio-input">
                <input
                  type="checkbox"
                  id="terms"
                  onClick={() => setAgreement(!agreement)}
                />
                <label htmlFor="terms">
                  <span className={`${agreement && "clicked"}`}></span>
                  Accept All Terms & Conditions*
                </label>
              </div>
            </div>
            <button className="button form__button" disabled={loading && true}>
              Create Account
            </button>
            <div className="form__signup">
              Already have account?{" "}
              <Link
                to={`/auth/signin${location.search}`}
                className="form__signup--text"
              >
                Sign in
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;
