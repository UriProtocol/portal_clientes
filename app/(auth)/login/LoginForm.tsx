"use client";

import InputError from "@/components/InputError";
import { useAuth } from "@/hooks/auth/auth";
import React, { useState } from "react";
import AuthSessionStatus from "./AuthSessionStatus";
import { InputGroup, Label, TextField } from "@heroui/react";
import { Checkbox } from "@heroui/react";
import { Button } from "@heroui/react";
import { ibmPlexSans, manrope } from "@/ui/fonts";
import { toast } from "sonner";
import { FaAsterisk, FaAt, FaEye, FaMailchimp, FaUser } from 'react-icons/fa6'
import { FaMailBulk } from "react-icons/fa";
import { CiAt } from "react-icons/ci";
import { Toaster } from "sonner";

const LoginForm = () => {
  const { login: loginFunction } = useAuth({
    middleware: "guest",
    redirectIfAuthenticated: "/",
  });

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [shouldRemember, setShouldRemember] = useState(true);
  const [errors, setErrors] = useState<any>(null);
  const [status, setStatus] = useState(null);
  const [isLoadingLogin, setIsLoadingLoading] = useState(false)

  const [passType, setPassType] = useState("password")

  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

  const validateEmail = (login: string) => login.match(regex);
  const isInvalid = React.useMemo(() => {
    if (email === "") return false;

    return validateEmail(email) ? false : true;
  }, [email]);

  const submitForm = async (event: React.SubmitEvent) => {
    event.preventDefault();

    setIsLoadingLoading(true)
    const loadingToast = toast.loading('Iniciando sesion...')

    try {
      await loginFunction({
        email,
        password,
        remember: shouldRemember,
        setErrors,
        setStatus,
      });
    } catch (error) {
      toast.error('Ocurrió un error inesperado al intentar iniciar sesión')
    } finally {
      setIsLoadingLoading(false)
      toast.dismiss(loadingToast)
    }


  };

  return (
    <>
      <AuthSessionStatus className="mb-4" status={status} />
      <form onSubmit={submitForm} className="flex flex-col gap-6">
        <TextField
          isRequired
          id="login"
          type="email"
          value={email}
          onChange={setEmail}
          isInvalid={isInvalid}
        >
          <Label className=" mb-1">Ingresar correo electrónico</Label>
          <InputGroup>
            <InputGroup.Input
              color={isInvalid ? "danger" : "default"}
              placeholder="email@email.com"
            />
            <InputGroup.Suffix>
              <FaAt className=" text-gray-300" />
            </InputGroup.Suffix>
          </InputGroup>
        </TextField>
        <InputError messages={errors?.login} className="-mt-3" />
        <TextField
          isRequired
          id="password"
          type={passType}
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
        >
          <Label className=" mb-1">Ingresar contraseña</Label>
          <InputGroup>
            <InputGroup.Input
              color={isInvalid ? "danger" : "default"}
              placeholder="Tu contraseña"
            />
            <InputGroup.Suffix>
              <Button
                isIconOnly
                className=" bg-transparent text-gray-300 -mr-3"
                onMouseDown={() => {
                  setPassType('text')
                }}
                onMouseUp={() => {
                  setPassType('password')
                }}
              >
                {
                  !password ? <FaAsterisk /> : <FaEye />
                }
              </Button>
            </InputGroup.Suffix>
          </InputGroup>
        </TextField>
        <InputError messages={errors?.password} className="-mt-3" />

        <div className="block mt-2">
          <Checkbox isSelected={shouldRemember} onChange={setShouldRemember}>
            <Checkbox.Content>
              <Checkbox.Control>
                <Checkbox.Indicator />
              </Checkbox.Control>
              Recordar usuario
            </Checkbox.Content>
          </Checkbox>
        </div>

        <div className="flex items-center justify-center">
          <Button
            type="submit"
            fullWidth
            size="lg"
            className={`bg-datia_primary text-white text-lg font-semibold ${manrope.className}`}
            isPending={isLoadingLogin}
            variant="primary"
          >
            Iniciar sesión
          </Button>
        </div>
      </form>
    </>
  );
};

export default LoginForm;
