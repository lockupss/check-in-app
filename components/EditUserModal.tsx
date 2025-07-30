'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import id from 'zod/v4/locales/id.cjs';

export default function EditUserModal({
  user,
  onClose,
  onSave,
}: {
  user: any;
  onClose: () => void;
  onSave: (updatedUser: any) => void;
}) {
  const [name, setName] = useState(user.name);
  const [userId, setUserId] = useState(user.userId);
  const [laptopBrand, setLaptopBrand] = useState(user.laptopBrand);

  const handleSave = () => {
    onSave({
      originalId: user.id, // this is required!
      id,
      name,
      userId,
      laptopBrand,
    });
    onClose();
  };

  function setDepartment(value: string): void {
    throw new Error('Function not implemented.');
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-amber-50 p-6 rounded-lg w-[450px] shadow-lg border border-amber-200">
        <h2 className="text-lg font-semibold mb-4 text-amber-900">Edit Registration Info</h2>

        <div className="space-y-4">
          <Input
            className="bg-amber-50 border-amber-300 text-amber-900 placeholder-amber-400 focus:ring-amber-500 focus:border-amber-500"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
          />
          <Input
            className="bg-amber-50 border-amber-300 text-amber-900 placeholder-amber-400 focus:ring-amber-500 focus:border-amber-500"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="User ID"
          />
          <Input
            className="bg-amber-50 border-amber-300 text-amber-900 placeholder-amber-400 focus:ring-amber-500 focus:border-amber-500"
            value={laptopBrand}
            onChange={(e) => setLaptopBrand(e.target.value)}
            placeholder="Laptop Brand"
          />
          <Input
            className="bg-amber-50 border-amber-300 text-amber-900 placeholder-amber-400 focus:ring-amber-500 focus:border-amber-500"
            value={user.department || ''}
            onChange={(e) => setDepartment(e.target.value)}
            placeholder="Department"
          />  
        </div>

        <div className="mt-6 flex justify-end space-x-2">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="text-amber-800 border-amber-600 hover:bg-amber-100 hover:text-amber-900"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            className="bg-amber-600 hover:bg-amber-700 text-amber-50"
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}