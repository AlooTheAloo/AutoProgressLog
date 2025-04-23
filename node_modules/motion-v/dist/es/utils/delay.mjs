function delay(fn) {
  return Promise.resolve().then(() => {
    fn();
  });
}
export {
  delay
};
