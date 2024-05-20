const validatePatchResumeStatus = (req, res, next) => {
  const { status, reason } = req.body;
  if (!status) {
    return res.status(400).json({ message: '변경하고자 하는 지원 상태를 입력해 주세요.' });
  }
  if (!reason) {
    return res.status(400).json({ message: '지원 상태 변경 사유를 입력해 주세요.' });
  }
  // 유효하지 않은 지원 상태인지 확인하는 로직은 여기에 추가
  next();
};

const requireRoles = (allowedRoles) => {
  return (req, res, next) => {
    const userRoles = req.user.role;
    console.log(req.user)
    console.log(userRoles)
    const allowed = allowedRoles.some(role => userRoles.includes(role));
    if (!allowed) {
      return res.status(403).json({ message: '접근 권한이 없습니다.' });
    }
    next();
  };
};

export { validatePatchResumeStatus, requireRoles }