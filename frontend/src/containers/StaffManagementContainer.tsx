import React from 'react';
import { StaffManagement } from '../components/clinic';
import { useClinicStaff } from '../hooks/useClinicStaff';

const StaffManagementContainer: React.FC = () => {
  const {
    staff,
    roles,
    departments,
    addStaffMember,
    updateStaffMember,
    deleteStaffMember,
    assignRole,
    updateSchedule,
  } = useClinicStaff();

  return (
    <StaffManagement
      staff={staff}
      roles={roles}
      departments={departments}
      onAddStaff={addStaffMember}
      onUpdateStaff={updateStaffMember}
      onDeleteStaff={deleteStaffMember}
      onAssignRole={assignRole}
      onUpdateSchedule={updateSchedule}
    />
  );
};

export default StaffManagementContainer;
