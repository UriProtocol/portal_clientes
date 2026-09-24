"use client"
import InputError from '@/components/auth/InputError'
import { axios, axiosBase } from '@/lib/axios'
import { Button, InputGroup, Label, TextField } from '@heroui/react'
import { isAxiosError } from 'axios'
import React, { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { FaSave } from 'react-icons/fa'
import { FaAsterisk, FaCheck, FaEye, FaKey, FaRepeat, FaXmark } from 'react-icons/fa6'

const isStrongPassword = (value: string) =>
    value.length >= 8 &&
    /[a-z]/.test(value) &&
    /[A-Z]/.test(value) &&
    /\d/.test(value) &&
    /[^A-Za-z0-9]/.test(value);

const passwordRules = [
    { label: 'Al menos 8 caracteres', test: (value: string) => value.length >= 8 },
    { label: 'Una letra minúscula', test: (value: string) => /[a-z]/.test(value) },
    { label: 'Una letra mayúscula', test: (value: string) => /[A-Z]/.test(value) },
    { label: 'Un número', test: (value: string) => /\d/.test(value) },
    { label: 'Un carácter especial', test: (value: string) => /[^A-Za-z0-9]/.test(value) },
]

type PasswordErrors = {
    current_password?: string[]
    password?: string[]
    password_confirmation?: string[]
}

export default function PasswordForm() {
    const [currentPassword, setCurrentPassword] = useState("")
    const [password, setPassword] = useState("")
    const [passwordConfirmation, setPasswordConfirmation] = useState("")
    const [showPasswords, setShowPasswords] = useState(false)
    const [errors, setErrors] = useState<PasswordErrors>({})
    const [isSaving, setIsSaving] = useState(false)

    const isPasswordInvalid = password !== "" && !isStrongPassword(password)
    const isConfirmationInvalid = passwordConfirmation !== "" && passwordConfirmation !== password
    const isSameAsCurrent = password !== "" && password === currentPassword

    const canSubmit = useMemo(() => (
        currentPassword !== "" &&
        isStrongPassword(password) &&
        password === passwordConfirmation &&
        !isSameAsCurrent
    ), [currentPassword, password, passwordConfirmation, isSameAsCurrent])

    const resetForm = () => {
        setCurrentPassword("")
        setPassword("")
        setPasswordConfirmation("")
        setErrors({})
    }

    const submitForm = async (event: React.FormEvent) => {
        event.preventDefault()
        if (!canSubmit) return

        setIsSaving(true)
        setErrors({})
        const loadingToast = toast.loading('Actualizando contraseña...')

        try {
            await axiosBase.get("sanctum/csrf-cookie")
            await axios.put("/password", {
                current_password: currentPassword,
                password,
                password_confirmation: passwordConfirmation,
            })
            toast.success('Contraseña actualizada correctamente')
            resetForm()
        } catch (error) {
            const response = isAxiosError(error) ? error.response : undefined
            if (response?.status === 422) {
                setErrors(response.data.errors ?? {})
                toast.error(response.data.message ?? 'Revisa los datos ingresados')
            } else if (response?.status === 429) {
                toast.error('Demasiados intentos. Espera un minuto e inténtalo de nuevo')
            } else {
                toast.error('Ocurrió un error inesperado al actualizar la contraseña')
            }
        } finally {
            setIsSaving(false)
            toast.dismiss(loadingToast)
        }
    }

    const inputType = showPasswords ? "text" : "password"

    return (
        <form onSubmit={submitForm} className='flex flex-col gap-3 w-full'>
            <div className='flex items-center justify-between gap-2'>
                <p className=' font-semibold text-xl'>Contraseña de acceso al portal</p>
                <Button
                    isIconOnly
                    variant='ghost'
                    size='sm'
                    aria-label={showPasswords ? 'Ocultar contraseñas' : 'Mostrar contraseñas'}
                    onPress={() => setShowPasswords(value => !value)}
                    className='text-datia-primary/50 shrink-0'
                >
                    <FaEye />
                </Button>
            </div>
            <TextField
                className="w-full"
                isRequired
                type={inputType}
                value={currentPassword}
                onChange={setCurrentPassword}
                isInvalid={!!errors.current_password}
                autoComplete="current-password"
            >
                <Label>Contraseña actual</Label>
                <InputGroup className={"mx-3"}>
                    <InputGroup.Input
                        placeholder='Escribe tu contraseña actual'
                        className="w-full"
                    />
                    <InputGroup.Suffix>
                        <FaKey className=' text-datia-primary/30' />
                    </InputGroup.Suffix>
                </InputGroup>
            </TextField>
            <InputError messages={errors.current_password} className="mx-3 -mt-2" />

            <TextField
                className="w-full"
                isRequired
                type={inputType}
                value={password}
                onChange={setPassword}
                isInvalid={isPasswordInvalid || isSameAsCurrent || !!errors.password}
                autoComplete="new-password"
            >
                <Label>Nueva contraseña</Label>
                <InputGroup className={"mx-3"}>
                    <InputGroup.Input
                        placeholder='Escribe tu nueva contraseña'
                        className="w-full"
                    />
                    <InputGroup.Suffix>
                        <FaAsterisk className=' text-datia-primary/30' />
                    </InputGroup.Suffix>
                </InputGroup>
            </TextField>
            <ul className='mx-3 -mt-1 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs'>
                {passwordRules.map(rule => {
                    const passed = rule.test(password)
                    return (
                        <li key={rule.label} className={`flex items-center gap-1.5 ${passed ? 'text-green-600' : 'text-datia-gray'}`}>
                            {passed ? <FaCheck /> : <FaXmark />}
                            {rule.label}
                        </li>
                    )
                })}
            </ul>
            {isSameAsCurrent && (
                <InputError messages={['La nueva contraseña debe ser distinta a la actual.']} className="mx-3 -mt-1" />
            )}
            <InputError messages={errors.password} className="mx-3 -mt-1" />

            <TextField
                className="w-full"
                isRequired
                type={inputType}
                value={passwordConfirmation}
                onChange={setPasswordConfirmation}
                isInvalid={isConfirmationInvalid}
                autoComplete="new-password"
            >
                <Label>Repite la nueva contraseña</Label>
                <InputGroup className={"mx-3"}>
                    <InputGroup.Input
                        placeholder='Repite la nueva contraseña'
                        className="w-full"
                    />
                    <InputGroup.Suffix>
                        <FaRepeat className=' text-datia-primary/30' />
                    </InputGroup.Suffix>
                </InputGroup>
            </TextField>
            {isConfirmationInvalid && (
                <InputError messages={['Las contraseñas no coinciden.']} className="mx-3 -mt-2" />
            )}

            <Button
                type='submit'
                size='lg'
                className='w-full mt-2'
                isDisabled={!canSubmit}
                isPending={isSaving}
            >
                <FaSave />
                Guardar contraseña
            </Button>
        </form>
    )
}
