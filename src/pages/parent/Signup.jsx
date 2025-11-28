import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import Card from '../../components/ui/Card.jsx';
import Notification from '../../components/ui/Notification.jsx';
import apiClient from '../../services/apiClient.js';
import axios from 'axios';

const defaultChild = { fullName: '', admissionNumber: '' };

const ParentSignup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting }
  } = useForm({ defaultValues: { children: [defaultChild], password: '', confirmPassword: '' } });
  const { fields, append, remove } = useFieldArray({ control, name: 'children' });
  const passwordValue = watch('password');
  const [notification, setNotification] = useState(null);

  const onSubmit = async ({ confirmPassword, password, ...values }) => {
    setNotification(null);
    const payload = { ...values, password: password?.trim() ? password : undefined };
    try {
      await axios.post(`https://full-sms-backend.onrender.com/api/auth/parent/signup`, payload);
      setNotification({
        type: 'success',
        message: payload.password
          ? 'Account created. You can sign in with the password you set.'
          : 'Account created. Check your email for login credentials.'
      });
    } catch (error) {
      const message = error.response?.data?.error?.message || 'Unable to complete signup';
      setNotification({ type: 'error', message });
    }
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Parent Self-Signup</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {notification && <Notification type={notification.type}>{notification.message}</Notification>}
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="First Name" {...register('firstName', { required: 'Required' })} error={errors.firstName?.message} />
          <Input label="Last Name" {...register('lastName', { required: 'Required' })} error={errors.lastName?.message} />
          <Input type="email" label="Email" {...register('email', { required: 'Required' })} error={errors.email?.message} />
          <Input label="Phone" {...register('phone')} />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Occupation" {...register('occupation')} />
          <Input label="Address" {...register('address')} />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            {...register('password', {
              minLength: { value: 8, message: 'Minimum 8 characters' }
            })}
            error={errors.password?.message}
            endAdornment={
              <button type="button" onClick={() => setShowPassword((prev) => !prev)} className="uppercase">
                {showPassword ? 'Hide' : 'Show'}
              </button>
            }
          />
          <Input
            label="Confirm Password"
            type={showConfirmPassword ? 'text' : 'password'}
            {...register('confirmPassword', {
              validate: (value) => (passwordValue ? value === passwordValue || 'Passwords do not match' : true)
            })}
            error={errors.confirmPassword?.message}
            endAdornment={
              <button type="button" onClick={() => setShowConfirmPassword((prev) => !prev)} className="uppercase">
                {showConfirmPassword ? 'Hide' : 'Show'}
              </button>
            }
          />
        </div>

        <Card title="Children">
          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="grid gap-4 md:grid-cols-2">
                <Input
                  label="Full Name"
                  {...register(`children.${index}.fullName`, { required: 'Required' })}
                  error={errors.children?.[index]?.fullName?.message}
                />
                <Input
                  label="Admission Number"
                  {...register(`children.${index}.admissionNumber`, { required: 'Required' })}
                  error={errors.children?.[index]?.admissionNumber?.message}
                />
                {fields.length > 1 && (
                  <Button type="button" variant="secondary" onClick={() => remove(index)}>
                    Remove
                  </Button>
                )}
              </div>
            ))}
            <Button type="button" variant="secondary" onClick={() => append(defaultChild)}>
              + Add Child
            </Button>
          </div>
        </Card>

        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Create Parent Account'}
        </Button>
        <p className="text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="text-sidebar underline">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
};

export default ParentSignup;
