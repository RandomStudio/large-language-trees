declare module 'written-number' {
    interface WrittenNumberOptions {
      lang?: string;
      noAnd?: boolean;
    }
  
    function writtenNumber(n: number, options?: WrittenNumberOptions): string;
  
    namespace writtenNumber {
      var defaults: WrittenNumberOptions;
    }
  
    export default writtenNumber;
  }
  