import React from 'react';
import FirestoreValidator from '@/components/debug/FirestoreValidator';
import FirestoreErrorDiagnostic from '@/components/debug/FirestoreErrorDiagnostic';
import type { Meta } from '@/@types/routes';

const FirestoreDebug = <T extends Meta>(_props: T) => {
  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-6">Diagnóstico do Firestore</h2>
      
      <div className="mb-8">
        <FirestoreErrorDiagnostic />
      </div>
      
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Validador Simples</h3>
        <FirestoreValidator />
      </div>
    </div>
  );
};

export default FirestoreDebug;
