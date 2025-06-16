import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { useState, useEffect } from 'react';

function RegistrationForm({
  attributes = null,
  handleCreateUser,
  formInformation = {
    title: "supermercados.com",
    description: "Queremos ayudarte, cuentanos quien eres.",
  },
}) {
  const [userID, setUserID] = useState(undefined);
  const [userName, setUserName] = useState(undefined);
  const [phone, setPhone] = useState(undefined);
  const [email, setEmail] = useState(undefined);
  const [enableSendSubscription, setEnableSendSubscription] = useState(false);
  const [error, setError] = useState({
    "id": null,
    "name": null,
    "email": null,
    "phone": null,
  });

  const isValidEmail = (email) => {
    const emailRegex = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    return emailRegex.test(email);
  };

  const isValidUsername = (username) => {
    const usernameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{1,100}$/;
    return usernameRegex.test(username);
  }

  const isValidPhone = (phone) => {
    const phoneRegex = /^\d{10}$/; // Adjust the regex based on your phone number format
    return phoneRegex.test(phone);
  };

  const isValidNumber = (number) => {
    const numberRegex = /^\d{4,11}$/; // Only digits
    return numberRegex.test(number);
  }

  useEffect(() => {
    if (email === undefined) { return; }
    if (email === "" || email === null || email.length < 5) {
      setEnableSendSubscription(false);
      setError(prevState => ({
        ...prevState,
        email: "Email no puede estar vacío o ser menor a 5 caracteres"
      }));
      return;
    }
    if (!isValidEmail(email)) {
      setEnableSendSubscription(false);
      setError(
        prevState => ({
          ...prevState,
          email: "Email no valido, debe tener un formato correcto (ejemplo@dominio.com)"
        })
      );
      return;
    }
    setError(prevState => ({
      ...prevState,
      email: null
    }));
  }, [email])

  useEffect(() => {
    if (userName === undefined) { return; }
    if (userName === ""
      || userName === null
      || userName.length < 1
    ) {
      setEnableSendSubscription(false);
      setError(prevState => ({
        ...prevState,
        name: "Nombre de usuario no puede estar vacío"
      }));
      return;
    }
    console.log("haciendo validacion de nombre de usuario", userName);
    if (!isValidUsername(userName)) {
      setEnableSendSubscription(false);
      setError(prevState => ({
        ...prevState,
        name: "Nombre de usuario no valido, debe tener entre 1 y 100 caracteres compuesto por solo letras y espacios intermedios"
      }));
      return;
    }
    setError(prevState => ({
      ...prevState,
      name: null
    }));
  }, [userName])

  useEffect(() => {
    if (userID === undefined) { return; }
    if (userID === "" || userID === null || userID.length < 4 || userID.length > 11) {
      setEnableSendSubscription(false);
      setError(prevState => ({
        ...prevState,
        id: "Identificacion no puede estar vacío o ser menor a 4 caracteres o mayor a 11 caracteres"
      }));
      return;
    }
    if (!isValidNumber(userID)) {
      setEnableSendSubscription(false);
      setError(prevState => ({
        ...prevState,
        id: "Identificacion no valida, debe tener entre 4 y 11 digitos (solo numeros)"
      }));
      return;
    }
    setError(prevState => ({
      ...prevState,
      id: null
    }));
  }, [userID])

  useEffect(() => {
    if (phone === undefined) { return; }
    if (phone === "" || phone === null || phone.length < 10 || phone.length > 10) {
      setEnableSendSubscription(false);
      setError(prevState => ({
        ...prevState,
        phone: "Telefono no puede estar vacío o ser menor a 10 caracteres"
      }));
      return;
    }
    if (!isValidPhone(phone) || (phone[0] != '6' && phone[0] != '3')) {
      setEnableSendSubscription(false);
      setError(prevState => ({
        ...prevState,
        phone: "Telefono no valido, debe tener 10 digitos (comenzando con 6 o 3)"
      }));
      return;
    }
    setError(prevState => ({
      ...prevState,
      phone: null
    }));
  }, [phone])

  useEffect(() => {
    if (
      userID !== "" && userName !== "" && phone !== "" && email !== ""
      && error.id === null
      && error.name === null
      && error.phone === null
      && error.email === null
    ) {
      setEnableSendSubscription(true);
    }
  }, [userID, userName, phone, email]);

  console.log("enableSendSubscription", enableSendSubscription);
  console.log("error", error);
  return (
    <div className="w-full h-full flex flex-col gap-2 min-h-[400px]" {...attributes}>
      <h3 className="font-semibold tracking-tight text-2xl">{formInformation.title}</h3>
      <p className="text-sm text-muted-foreground">{formInformation.description}</p>
      <Separator className="my-2" />
      <div className="grid w-full max-w-sm items-center gap-2">
        <div className="grid w-full max-w-sm items-center gap-2">
          <Label htmlFor="username">Identificacion</Label>
          <Input
            id="user_identification"
            name="user_identification"
            placeholder="identificacion ..."
            type="text"
            required
            className="w-full"
            value={userID}
            onChange={(e) => setUserID(e.target.value)}
          />
          {error.id !== null && <p className="text-red-500 text-[9px]">{error.id}</p>}
        </div>
        <div className="grid w-full max-w-sm items-center gap-2">
          <Label htmlFor="username">Nombre </Label>
          <Input
            id="username"
            name="username"
            placeholder="tu nombre ..."
            type="text"
            required
            className="w-full"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
          {error.name !== null && <p className="text-red-500 text-[9px]">{error.name}</p>}
        </div>
        <div className="grid w-full max-w-sm items-center gap-2">
          <Label htmlFor="email">Telefono</Label>
          <Input
            id="phone_input"
            name="text"
            placeholder="tu telefono ..."
            type="text"
            required
            className="w-full"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          {error?.phone !== null && <p className="text-red-500 text-[9px]">{error.phone}</p>}
        </div>
        <div className="grid w-full max-w-sm items-center gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email_input"
            name="email"
            placeholder="tu Email ..."
            type="email"
            required
            className="w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {error?.email !== null && <p className="text-red-500 text-[9px]">{error.email}</p>}
        </div>
        <Button
          type="button"
          onClick={() => {
            handleCreateUser({ "username": userName, "email": email, "userID": userID, "phone": phone })
          }}
          disabled={!enableSendSubscription}
        >
          Registrarse e Iniciar
        </Button>
      </div>
    </div>
  )
}

export default RegistrationForm